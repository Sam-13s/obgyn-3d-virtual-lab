from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class LearningModule(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=180)
    category = models.CharField(max_length=80)
    description = models.TextField()
    icon = models.CharField(max_length=12, blank=True)
    model_key = models.CharField(max_length=60, blank=True)
    topics = models.JSONField(default=list, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    def __str__(self): return self.title

class QuizQuestion(models.Model):
    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE, related_name='questions', null=True, blank=True)
    question = models.TextField()
    options = models.JSONField(default=list)
    correct_index = models.PositiveSmallIntegerField()
    explanation = models.TextField(blank=True)
    source_url = models.URLField(blank=True)
    def __str__(self): return self.question[:80]

class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='quiz_attempts')
    student_name = models.CharField(max_length=120, default='GNM Student')
    score = models.PositiveSmallIntegerField()
    total = models.PositiveSmallIntegerField()
    answers = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f'{self.student_name}: {self.score}/{self.total}'

class StudyProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_progress')
    module_key = models.SlugField(max_length=64)
    seconds_studied = models.PositiveIntegerField(default=0)
    visit_count = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['user', 'module_key'], name='unique_user_module_study_progress')]
        ordering = ['-last_activity']

    def __str__(self): return f'{self.user}: {self.module_key} ({self.seconds_studied}s)'
