# Generated by Django 3.2.9 on 2021-12-29 00:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('fretboard_exercises', '0002_alter_note_note'),
    ]

    operations = [
        migrations.RenameField(
            model_name='note',
            old_name='note',
            new_name='name',
        ),
    ]
