from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health),
    path('auth/csrf/', views.csrf),
    path('auth/signup/', views.register),
    path('auth/login/', views.sign_in),
    path('auth/logout/', views.sign_out),
    path('auth/me/', views.current_user),
    path('study/progress/', views.study_progress),
    path('study/activity/', views.record_study_activity),
    path('admin/users/', views.admin_users),
    path('admin/users/<int:user_id>/', views.admin_user_status),
    path('modules/', views.ModuleList.as_view()),
    path('modules/<slug:slug>/', views.ModuleDetail.as_view()),
    path('quiz/questions/', views.QuizList.as_view()),
    path('quiz/submit/', views.submit_quiz),
    path('quiz/submit/anatomy/', views.submit_anatomy_quiz),
    path('quiz/attempts/', views.AttemptList.as_view()),
]
