from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from .models import Directory

@receiver(post_save, sender=User)
def create_user_directories(sender, instance, created, **kwargs):
    def create_by_name(name):
        Directory.objects.create(name=name,owner=instance)
    if created:
        create_by_name('/')
        create_by_name('/Shared_With_Me/')