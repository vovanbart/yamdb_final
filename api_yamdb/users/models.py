from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    USER = 'user'
    MODERATOR = 'moderator'
    ADMIN = 'admin'

    ROLES = (
        (USER, USER),
        (MODERATOR, MODERATOR),
        (ADMIN, ADMIN),
    )

    bio = models.TextField('Биография',
                           blank=True,)
    role = models.CharField('Роль',
                            max_length=10,
                            choices=ROLES,
                            default=USER)
    email = models.EmailField('E-mail',
                              unique=True,)

    def is_admin(self):
        return self.role == self.ADMIN or self.is_superuser

    def is_moderator(self):
        return self.role == self.MODERATOR

    class Meta:
        ordering = ('username',)

    def __str__(self):
        if self.username:
            return self.username
        return self.email
