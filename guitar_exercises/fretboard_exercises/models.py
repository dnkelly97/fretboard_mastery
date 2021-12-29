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
        ('G#/Ab', 'G#/Ab'),
        ('A#/Bb', 'A#/Bb'),
        ('C#/Db', 'C#/Db'),
        ('D#/Eb', 'D#/Eb'),
        ('F#/Gb', 'F#/Gb'),
    ]
    name = models.CharField(choices=NOTE_CHOICES, max_length=5)
    frequency = models.FloatField()

    def sharp_name(self):
        return self.name.split('/')[0]

    def flat_name(self):
        return self.name.split('/')[-1]


class FretboardLocation(models.Model):
    STRING_CHOICES = [(i, i) for i in range(1, 7)]
    FRET_CHOICES = [(i, i) for i in range(13)]
    string = models.IntegerField(choices=STRING_CHOICES)
    fret = models.IntegerField(choices=FRET_CHOICES)
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
