from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    #required by the auth model
    username = models.CharField(unique=True, max_length=20)
    email = models.EmailField()