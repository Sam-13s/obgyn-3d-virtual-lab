from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.db.models import Count, F, Prefetch, Sum
from django.http import JsonResponse
from django.middleware.csrf import get_token
from random import sample
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import generics, status, exceptions
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from .models import LearningModule, QuizQuestion, QuizAttempt, StudyProgress
from .serializers import LearningModuleSerializer, QuizQuestionSerializer, QuizAttemptSerializer, UserRegistrationSerializer
from .assignment_bank import OBJECTIVE_QUESTIONS, THEORY_QUESTIONS, WHO_ANC, WHO_MATERNAL, ACOG_LABOUR, ACOG_FETUS, NHS_CYCLE, WHO_PNC

STUDY_MODULES = {
    'female-reproductive-anatomy': 'Female Reproductive Anatomy',
    'menstrual-cycle': 'Menstrual Cycle',
    'pregnancy-development': 'Pregnancy & Fetal Development',
    'antenatal-care': 'Antenatal Care',
    'stages-of-labour': 'Stages of Labour',
    'normal-assisted-delivery': 'Normal & Assisted Delivery',
    'gynecological-conditions': 'Gynecological Conditions',
    'family-planning': 'Family Planning & Reproductive Health',
}

def serialize_study_progress(entry):
    return {
        'module_key': entry.module_key,
        'module_title': STUDY_MODULES[entry.module_key],
        'seconds_studied': entry.seconds_studied,
        'visit_count': entry.visit_count,
        'last_activity': entry.last_activity,
    }

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def study_progress(request):
    records = list(StudyProgress.objects.filter(user=request.user).order_by('-last_activity'))
    attempts = QuizAttempt.objects.filter(user=request.user).order_by('-created_at')
    latest = attempts.first()
    scores = list(attempts.values_list('score', 'total')[:1000])
    best_percentage = max((round(score / total * 100) for score, total in scores if total), default=None)
    total_seconds = sum(item.seconds_studied for item in records)
    return Response({
        'modules': [serialize_study_progress(item) for item in records],
        'totals': {
            'seconds_studied': total_seconds,
            'modules_started': len(records),
            'quiz_attempts': attempts.count(),
        },
        'quiz': {
            'attempt_count': attempts.count(),
            'best_percentage': best_percentage,
            'latest': ({'score': latest.score, 'total': latest.total, 'created_at': latest.created_at} if latest else None),
        },
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_study_activity(request):
    module_key = request.data.get('module_key')
    action = request.data.get('action')
    if not isinstance(module_key, str) or module_key not in STUDY_MODULES:
        return Response({'module_key': 'Choose a valid learning module.'}, status=status.HTTP_400_BAD_REQUEST)
    if not isinstance(action, str) or action not in ('open', 'time'):
        return Response({'action': 'Use open or time.'}, status=status.HTTP_400_BAD_REQUEST)
    seconds = request.data.get('seconds', 0)
    if action == 'open':
        seconds = 0
    elif isinstance(seconds, bool) or not isinstance(seconds, int) or not 1 <= seconds <= 60:
        return Response({'seconds': 'Study-time updates must be whole seconds from 1 to 60.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        progress, _ = StudyProgress.objects.get_or_create(user=request.user, module_key=module_key)
        if action == 'open':
            StudyProgress.objects.filter(pk=progress.pk).update(visit_count=F('visit_count') + 1, last_activity=timezone.now())
        else:
            StudyProgress.objects.filter(pk=progress.pk).update(seconds_studied=F('seconds_studied') + seconds, last_activity=timezone.now())
        progress.refresh_from_db()
    return Response(serialize_study_progress(progress))

class ModuleList(generics.ListAPIView):
    serializer_class = LearningModuleSerializer
    queryset = LearningModule.objects.filter(is_published=True).order_by('order')
    permission_classes = [AllowAny]
class ModuleDetail(generics.RetrieveAPIView):
    serializer_class = LearningModuleSerializer
    queryset = LearningModule.objects.filter(is_published=True)
    lookup_field = 'slug'
    permission_classes = [AllowAny]
class QuizList(generics.ListAPIView):
    serializer_class = QuizQuestionSerializer
    queryset = QuizQuestion.objects.exclude(source_url='').order_by('id')
    permission_classes = [AllowAny]
    def list(self, request, *args, **kwargs):
        pool = list(self.get_queryset())
        if len(pool) < 30:
            return Response({'detail': 'The assignment question bank is not ready. Run the seed_lab management command.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        selected = sample(pool, 30)
        return Response({
            'objective': self.get_serializer(selected, many=True).data,
            'theory': [{'id': index + 1, 'question': question} for index, question in enumerate(THEORY_QUESTIONS)],
            'references': [
                {'title': 'WHO antenatal care recommendations', 'url': WHO_ANC},
                {'title': 'WHO maternal health recommendations', 'url': WHO_MATERNAL},
                {'title': 'WHO pregnancy, childbirth and postnatal care', 'url': WHO_PNC},
                {'title': 'ACOG labor guidance', 'url': ACOG_LABOUR},
                {'title': 'ACOG fetal growth information', 'url': ACOG_FETUS},
                {'title': 'NHS menstrual cycle and fertility', 'url': NHS_CYCLE},
            ],
        })
class AttemptList(generics.ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).order_by('-created_at')

@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({'status':'ok','service':'OB-GYN 3D Virtual Lab API','version':'1.0.0'})

def public_user(user):
    return {'id': user.id, 'username': user.get_username(), 'email': user.email,
            'first_name': user.first_name, 'last_name': user.last_name,
            'is_staff': user.is_staff, 'is_superuser': user.is_superuser}

def require_csrf(request):
    """DRF exempts APIView dispatch from Django's middleware CSRF check.
    Enforce it explicitly on public endpoints that create authenticated sessions.
    """
    try:
        SessionAuthentication().enforce_csrf(request)
    except exceptions.PermissionDenied as error:
        return Response({'detail': str(error)}, status=status.HTTP_403_FORBIDDEN)
    return None

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def csrf(request):
    return Response({'csrfToken': get_token(request)})

@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(public_user(request.user))

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    csrf_error = require_csrf(request)
    if csrf_error:
        return csrf_error
    if request.user.is_authenticated:
        return Response({'detail': 'Log out before creating another account.'}, status=status.HTTP_400_BAD_REQUEST)
    serializer = UserRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    values = serializer.validated_data
    User = get_user_model()
    candidate = User(username=values['username'], email=values['email'],
                     first_name=values.get('first_name', ''), last_name=values.get('last_name', ''))
    from django.core.exceptions import ValidationError
    try:
        validate_password(values['password'], user=candidate)
    except ValidationError as error:
        return Response({'password': list(error.messages)}, status=status.HTTP_400_BAD_REQUEST)
    candidate.set_password(values['password'])
    candidate.save()
    login(request, candidate)
    return Response(public_user(candidate), status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in(request):
    csrf_error = require_csrf(request)
    if csrf_error:
        return csrf_error
    identifier = str(request.data.get('username', '')).strip()
    password = request.data.get('password', '')
    User = get_user_model()
    username = identifier
    if '@' in identifier:
        match = User.objects.filter(email__iexact=identifier).only('username').first()
        username = match.username if match else identifier
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'detail': 'Username/email or password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    login(request, user)
    return Response(public_user(user))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sign_out(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users(request):
    User = get_user_model()
    recent_attempts = Prefetch('quiz_attempts', queryset=QuizAttempt.objects.order_by('-created_at')[:5], to_attr='recent_quiz_attempts')
    study_records = Prefetch('study_progress', queryset=StudyProgress.objects.order_by('-last_activity'), to_attr='study_records')
    users = User.objects.annotate(quiz_attempt_count=Count('quiz_attempts')).prefetch_related(recent_attempts, study_records).order_by('-date_joined')[:500]
    payload = []
    for user in users:
        payload.append({**public_user(user), 'date_joined': user.date_joined,
                        'is_active': user.is_active, 'quiz_attempt_count': user.quiz_attempt_count,
                        'study_seconds': sum(item.seconds_studied for item in user.study_records),
                        'study_module_count': len(user.study_records),
                        'study_modules': [{'module_key': item.module_key, 'module_title': STUDY_MODULES.get(item.module_key, item.module_key),
                                           'seconds_studied': item.seconds_studied, 'visit_count': item.visit_count,
                                           'last_activity': item.last_activity} for item in user.study_records],
                        'recent_attempts': [{'id': item.id, 'score': item.score, 'total': item.total, 'created_at': item.created_at}
                                            for item in user.recent_quiz_attempts]})
    return Response(payload)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_user_status(request, user_id):
    User = get_user_model()
    try:
        target = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    if 'is_active' not in request.data or not isinstance(request.data['is_active'], bool):
        return Response({'is_active': 'Send true or false.'}, status=status.HTTP_400_BAD_REQUEST)
    if target.pk == request.user.pk:
        return Response({'detail': 'You cannot deactivate your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)
    if target.is_staff and not request.user.is_superuser:
        return Response({'detail': 'Only a superuser can change an admin account.'}, status=status.HTTP_403_FORBIDDEN)
    target.is_active = request.data['is_active']
    target.save(update_fields=['is_active'])
    return Response({**public_user(target), 'is_active': target.is_active})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request):
    answers = request.data.get('objective_answers', request.data.get('answers', {}))
    theory_answers = request.data.get('theory_answers', [])
    if not isinstance(answers, dict) or not isinstance(theory_answers, list) or len(theory_answers) != len(THEORY_QUESTIONS) or any(not isinstance(answer, str) or not answer.strip() for answer in theory_answers):
        return Response({'answers': 'Submit all 30 objective responses and all 10 written responses.'}, status=status.HTTP_400_BAD_REQUEST)
    student_name = request.user.get_full_name() or request.user.get_username()
    question_ids = list(answers.keys())
    questions_by_id = {str(question.id): question for question in QuizQuestion.objects.filter(id__in=question_ids)}
    if len(answers) != 30 or set(questions_by_id) != set(question_ids):
        return Response({'answers': 'Answer all 30 questions from the current assignment.'}, status=status.HTTP_400_BAD_REQUEST)
    correct = 0
    results = []
    for question_id, selected in answers.items():
        question = questions_by_id[question_id]
        if isinstance(selected, bool) or not isinstance(selected, int) or not 0 <= selected < len(question.options):
            return Response({'answers': f'Choose a listed option for question {len(results) + 1}.'}, status=status.HTTP_400_BAD_REQUEST)
        is_correct = selected == question.correct_index
        correct += int(is_correct)
        results.append({'question_id':question.id,'selected':selected,'correct_index':question.correct_index,'is_correct':is_correct,'explanation':question.explanation,'source_url':question.source_url})
    saved_answers = {'objective': answers, 'theory': [answer.strip() for answer in theory_answers]}
    attempt = QuizAttempt.objects.create(user=request.user, student_name=student_name, score=correct, total=30, answers=saved_answers)
    return Response({'attempt_id':attempt.id,'score':correct,'total':30,'percentage':round(correct/30*100),'results':results,'theory_saved':True}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_anatomy_quiz(request):
    questions = [
        {'question': 'Where does implantation normally occur?', 'options': ['Ovary', 'Endometrium', 'Vagina', 'Cervix'], 'correct_index': 1, 'explanation': 'Implantation normally occurs in the endometrium, the inner lining of the uterus.'},
        {'question': 'Where does fertilisation commonly occur?', 'options': ['Ampulla of fallopian tube', 'Cervix', 'Vagina', 'Uterine fundus'], 'correct_index': 0, 'explanation': 'Fertilisation commonly occurs in the ampulla of the fallopian tube.'},
        {'question': 'Which organ produces ova and reproductive hormones?', 'options': ['Uterus', 'Cervix', 'Ovary', 'Vagina'], 'correct_index': 2, 'explanation': 'The ovaries produce oocytes and hormones including oestrogen and progesterone.'},
    ]
    answers = request.data.get('answers')
    if not isinstance(answers, list) or len(answers) != len(questions):
        return Response({'answers': 'Answer every anatomy question before submitting.'}, status=status.HTTP_400_BAD_REQUEST)
    results = []
    for index, (selected, question) in enumerate(zip(answers, questions)):
        if isinstance(selected, bool) or not isinstance(selected, int) or not 0 <= selected < len(question['options']):
            return Response({'answers': f'Choose a listed option for question {index + 1}.'}, status=status.HTTP_400_BAD_REQUEST)
        is_correct = selected == question['correct_index']
        results.append({'selected': selected, 'correct_index': question['correct_index'], 'is_correct': is_correct, 'explanation': question['explanation']})
    score = sum(result['is_correct'] for result in results)
    attempt = QuizAttempt.objects.create(user=request.user, student_name=request.user.get_full_name() or request.user.get_username(), score=score, total=len(questions), answers={str(index): answer for index, answer in enumerate(answers)})
    return Response({'attempt_id': attempt.id, 'score': score, 'total': len(questions), 'percentage': round(score / len(questions) * 100), 'results': results}, status=status.HTTP_201_CREATED)
