import csv

from django.conf import settings
from django.core.management import BaseCommand
from django.db.models.fields.related import ForeignKey

from reviews.models import (
    Category, Comment, Genre, GenreTitle, Review, Title
)
from users.models import User

TABLES_DICT = {
    User:           'users.csv',
    Category:       'category.csv',
    Genre:          'genre.csv',
    Title:          'titles.csv',
    Review:         'review.csv',
    Comment:        'comments.csv',
    GenreTitle:     'genre_title.csv',
}

# Порядок удаления (от зависимых к родительским)
DELETE_ORDER = [
    GenreTitle,
    Comment,
    Review,
    Title,
    Genre,
    Category,
    User,
]


class Command(BaseCommand):
    help = 'Load csv data'

    def handle(self, *args, **kwargs):
        # 1) Очистим таблицы от старых данных
        for model in DELETE_ORDER:
            self.stdout.write(f'Deleting existing records for {model.__name__}...')
            model.objects.all().delete()

        # 2) Загрузим свежие CSV
        for model, filename in TABLES_DICT.items():
            path = f'{settings.BASE_DIR}/static/data/{filename}'
            self.stdout.write(f'Loading {filename} into {model.__name__}...')
            with open(path, 'r', encoding='UTF-8') as csv_file:
                reader = csv.DictReader(csv_file)
                objs = []
                for row in reader:
                    # Переносим значения FK в <field>_id
                    for field in model._meta.fields:
                        if isinstance(field, ForeignKey):
                            name = field.name
                            if name in row and row[name] != '':
                                row[f'{name}_id'] = row.pop(name)
                    objs.append(model(**row))
                # bulk_create с игнорированием конфликтов по PK
                model.objects.bulk_create(objs, ignore_conflicts=True)
            self.stdout.write(self.style.SUCCESS(
                f'Successfully loaded {model.__name__} from {filename}'
            ))

        self.stdout.write(self.style.SUCCESS('All CSV data loaded.'))