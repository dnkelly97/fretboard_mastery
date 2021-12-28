import pytest
from django.urls import reverse
from .utils import ValidationErrorTestingMixin
import json
from fretboard_exercises.models import Note, FretboardLocation
import pdb


class TestFretboardExerciseViews:

    def test_note_xhr(self, client):
        url = reverse('new_note')
        request_data = {'strings': [5, 6], 'notes': ['A', 'B', 'C']}
        # after 100 trials, probability that a wrong note or string was possible but didn't happen is vanishingly small
        for i in range(100):
            response = client.post(url, request_data)
            note_info = json.loads(response.content)
            assert note_info['frequency']
            assert note_info['note'] in request_data['notes']
            assert note_info['string'] in request_data['strings']
        # pdb.set_trace()


class TestNoteModel(ValidationErrorTestingMixin):

    def test_note_model_validations(self):
        with self.assert_validation_error(['note']):
            Note(note='e', frequency=100.56).full_clean()
        Note(note='E', frequency=100.678).full_clean()
        Note(note='F#', frequency=100.6).full_clean()


@pytest.mark.django_db
class TestFretboardLocationModel(ValidationErrorTestingMixin):

    def test_fretboard_location_model_validations(self):
        note = Note(note='E', frequency=100.7)
        note.full_clean()
        note.save()
        with self.assert_validation_error(['note', 'string', 'fret']):
            FretboardLocation(string=-1, fret=13).full_clean()
        FretboardLocation(string=1, fret=2, note=note).full_clean()
