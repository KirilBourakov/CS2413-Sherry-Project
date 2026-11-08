from django.urls import path

from . import views

urlpatterns = [
    path('auth/login', views.Login.as_view(), name='login'),
    path('auth/login/refresh', views.Refresh.as_view(), name='refresh'),
    path('auth/logout', views.Logout.as_view(), name='logout'),
    path('auth/register', views.UserRegister.as_view(), name='register'),

    path('auth/check', views.CheckUser.as_view(), name='checkUser'),
    path('get', views.GetUser.as_view(), name='GetUser'),
]