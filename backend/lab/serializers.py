from rest_framework import serializers
from .models import LearningModule, QuizQuestion, QuizAttempt
class LearningModuleSerializer(serializers.ModelSerializer):
    class Meta: model = LearningModule; fields = ['id','slug','title','category','description','icon','model_key','topics','order']
class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta: model = QuizQuestion; fields = ['id','module','question','options','explanation','source_url']
class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta: model = QuizAttempt; fields = ['id','student_name','score','total','answers','created_at']; read_only_fields = fields

class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False, min_length=10)
    def validate_username(self, value):
        from django.contrib.auth import get_user_model
        if get_user_model().objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('That username is already in use.')
        return value
    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        if get_user_model().objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

class AdminUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField(allow_blank=True)
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    is_active = serializers.BooleanField()
    is_staff = serializers.BooleanField()
    date_joined = serializers.DateTimeField()
    quiz_attempt_count = serializers.IntegerField()
    recent_attempts = serializers.ListField()
