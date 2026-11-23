from django.contrib import admin
from .models import LearningModule, QuizQuestion, QuizAttempt
@admin.register(LearningModule)
class LearningModuleAdmin(admin.ModelAdmin): list_display = ('title','category','order','is_published'); prepopulated_fields = {'slug':('title',)}
@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin): list_display = ('question','module')
@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin): list_display = ('student_name','score','total','created_at')
