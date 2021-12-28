from django.db import models

# Create your models here.


class Note(models.Model):
    NOTE_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
        ('E', 'E'),
        ('F', 'F'),
        ('G', 'G'),
        ('Ab', 'Ab'),
        ('G#', 'G#'),
        ('A#', 'A#'),
        ('Bb', 'Bb'),
        ('C#', 'C#'),
        ('Db', 'Db'),
        ('D#', 'D#'),
        ('Eb', 'Eb'),
        ('F#', 'F#'),
        ('Gb', 'Gb'),
    ]
    note = models.CharField(choices=NOTE_CHOICES, max_length=2)
    frequency = models.FloatField()


class FretboardLocation(models.Model):
    STRING_CHOICES = [(i, i) for i in range(1, 7)]
    FRET_CHOICES = [(i, i) for i in range(13)]
    string = models.IntegerField(choices=STRING_CHOICES)
    fret = models.IntegerField(choices=FRET_CHOICES)
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
