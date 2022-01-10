from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import random
from django.db.models import Q
from .models import Note, GuitarFretboardLocation
# Create your views here.


INSTRUMENT_MODEL_MAP = {'guitar': GuitarFretboardLocation}


def index(request, instrument):
    return render(request, 'fretboard_exercises/index.html', {'note': '?', 'string': '?', 'frequency': '?'})


def get_new_note(request, instrument):
    allowed_strings = list(map(str, request.POST.getlist('strings')))
    allowed_notes = request.POST.getlist('notes')
    fretboard_location = INSTRUMENT_MODEL_MAP[instrument].objects.filter(note__name__in=allowed_notes, string__in=allowed_strings, fret__lte=11).order_by('?').first()
    return JsonResponse({'note': fretboard_location.note.name, 'string': fretboard_location.string, 'frequency': fretboard_location.note.frequency})

# TODO add timer and score count to UI
