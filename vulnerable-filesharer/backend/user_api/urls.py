from django.urls import path, include
from . import views

urlpatterns = [
    path('auth/login', views.UserLogin.as_view(), name='login'),
    path('auth/register', views.UserRegister.as_view(), name='register'),
    path('auth/check', views.CheckUser.as_view(), name='checkUser'),
    path('auth/', include('knox.urls')),
    path('get', views.GetUser.as_view(), name='GetUser'),
    
]