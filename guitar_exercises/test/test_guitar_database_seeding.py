from fretboard_exercises.models import Note, GuitarFretboardLocation
import pytest


@pytest.mark.django_db
class TestGuitarSeeding:

    test_locations = [
        # Test open strings - which uses the one string higher in number and 5 frets higher to calculate the information
        (6, 0, 'E', 82.41),
        (5, 0, 'A', 110),
        (4, 0, 'D', 146.83),
        (3, 0, 'G', 196),
        (2, 0, 'B', 246.94),
        (1, 0, 'E', 329.63),
        # Test frets within 5 of the number of frets for each string, including sharps and flats - this way uses one
        # string higher in number and 7 frets lower to calculate information
        (6, 21, 'C#/Db', 277.18),
        (5, 21, 'F#/Gb', 370),
        (4, 21, 'B', 493.88),
        (3, 21, 'E', 659.24),
        (2, 21, 'G#/Ab', 830.64),
        (1, 21, 'C#/Db', 1108.74),
    ]

    @pytest.mark.parametrize("string, fret, note_name, frequency", test_locations)
    def test_fretboard_location_notes(self, string, fret, note_name, frequency):
        location = GuitarFretboardLocation.objects.get(string=string, fret=fret)
        assert location.note.name == note_name
        assert location.note.frequency == pytest.approx(frequency, 0.1)

    def test_fretboard_locations_exist(self):
        for string in range(1, 7):
            for fret in range(23):
                assert GuitarFretboardLocation.objects.get(string=string, fret=fret)

    def test_number_of_notes(self):
        assert Note.objects.all().count() == 47
