from django.shortcuts import get_object_or_404
from rest_framework import filters, status, viewsets
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from api_yamdb.settings import ADMIN_EMAIL
from rest_framework_simplejwt.tokens import RefreshToken

from reviews.models import Category, Genre, Review, Title
from users.models import User

from .filters import TitleFilter
from .permissions import (IsAuthorOrReadOnly,
                          IsModerator,
                          IsAdmin,
                          ReadOnly)
from .serializers import (CategorySerializer,
                          CommentSerializer,
                          GenreSerializer,
                          ReviewSerializer,
                          TitleCreateSerializer,
                          TitleSerializer,
                          UserSerializer,
                          AdminUserSerializer,
                          SignupSerializer,
                          TokenSerializer)


class TitleViewSet(viewsets.ModelViewSet):
    """
    Admin manage titles, other read
    """
    queryset = Title.objects.all()
    permission_classes = (IsAdmin | ReadOnly,)
    filterset_class = TitleFilter

    def get_serializer_class(self):
        if self.request.method in ('POST', 'PATCH',):
            return TitleCreateSerializer
        return TitleSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    Admin, Moderator manage reviews
    User manage self reviews
    """
    serializer_class = ReviewSerializer
    permission_classes = (
        IsAdmin | IsModerator | IsAuthorOrReadOnly,
    )

    def get_queryset(self):
        title_id = self.kwargs.get('title_id')
        title = get_object_or_404(Title, id=title_id)
        return title.reviews.all()

    def perform_create(self, serializer):
        title_id = self.kwargs.get('title_id')
        title = get_object_or_404(Title, id=title_id)
        serializer.save(author=self.request.user, title=title)


class CommentViewSet(viewsets.ModelViewSet):
    """
    Admin, Moderator manage comments
    User manage self comments
    """
    serializer_class = CommentSerializer
    permission_classes = (
        IsAdmin | IsModerator | IsAuthorOrReadOnly,
    )

    def get_queryset(self):
        review_id = self.kwargs.get('review_id')
        review = get_object_or_404(Review, id=review_id)
        return review.comments.all()

    def perform_create(self, serializer):
        review_id = self.kwargs.get('review_id')
        review = get_object_or_404(Review, id=review_id)
        serializer.save(author=self.request.user, review=review)


class GenreViewSet(viewsets.ModelViewSet):
    """
    Admin can manage genres, other can only read
    """
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = (IsAdmin | ReadOnly,)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name',)

    @action(
        detail=False,
        methods=('delete',),
        url_path=r'(?P<slug>\w+)',
        lookup_field='slug',
        url_name='category_slug',
    )
    def delete_genre(self, request, slug):
        category = self.get_object()
        serializer = CategorySerializer(category)
        category.delete()
        return Response(serializer.data, status=status.HTTP_204_NO_CONTENT)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Admin can manage genres, other can only read
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (IsAdmin | ReadOnly,)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name',)

    @action(
        detail=False,
        methods=('delete',),
        url_path=r'(?P<slug>\w+)',
        lookup_field='slug',
        url_name='category_slug',
    )
    def delete_category(self, request, slug):
        category = self.get_object()
        serializer = CategorySerializer(category)
        category.delete()
        return Response(serializer.data, status=status.HTTP_204_NO_CONTENT)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = (IsAdmin,)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('username',)
    lookup_field = 'username'
    lookup_value_regex = r'[\w\@\.\+\-]+'

    @action(
        detail=False,
        methods=['get', 'patch'],
        url_path='me',
        url_name='me',
        permission_classes=(IsAuthenticated,)
    )
    def about(self, request):
        serializer = UserSerializer(request.user)
        if request.method == 'PATCH':
            serializer = UserSerializer(
                request.user,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    Create user.
    """
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    send_code(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def new_code(request):
    """
    Confirmation code.
    """
    serializer = UserSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    username = serializer.data['username']
    email = serializer.data['email']
    user = get_object_or_404(User, username=username, email=email)
    send_code(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


def send_code(user):
    """
    Send code.
    """
    code = default_token_generator.make_token(user)
    subject = 'Код'
    message = f'{code} - ваш код'
    admin_email = ADMIN_EMAIL
    user_email = (user.email,)
    return send_mail(subject, message, admin_email, user_email)


@api_view(['POST'])
@permission_classes([AllowAny])
def token(request):
    serializer = TokenSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    username = serializer.data['username']
    user = get_object_or_404(User, username=username)
    confirmation_code = serializer.data['confirmation_code']
    if not default_token_generator.check_token(user, confirmation_code):
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    token = RefreshToken.for_user(user)
    return Response(
        {'token': str(token.access_token)}, status=status.HTTP_200_OK
    )
