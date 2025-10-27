from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils.datastructures import MultiValueDictKeyError
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
    print("allowed notes: ", allowed_notes)

    try:
        previous_note = request.POST.get('previous_note')
        if previous_note in allowed_notes:
            allowed_notes.remove(previous_note)

        previous_string = request.POST.get('previous_string')
        if previous_string in allowed_strings:
            allowed_strings.remove(previous_string)

    except MultiValueDictKeyError:
        print("multivalue dict key error")
        pass
    
    if not allowed_notes or not allowed_strings:
        return JsonResponse({'status': False, 'message': 'At least one note and one string must be selected'}, status=406)
    
    fretboard_location = INSTRUMENT_MODEL_MAP[instrument].objects.filter(note__name__in=allowed_notes, string__in=allowed_strings, fret__lte=11).order_by('?').first()
    return JsonResponse({'note': fretboard_location.note.name, 'string': fretboard_location.string, 'frequency': fretboard_location.note.frequency})

