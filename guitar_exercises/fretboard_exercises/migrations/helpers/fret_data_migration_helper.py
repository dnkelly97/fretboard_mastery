from django.db import router, migrations
import csv


def load_fretboard_data(apps, schema_editor, **context):
    Note = apps.get_model('fretboard_exercises', 'Note')
    FretboardLocation = apps.get_model('fretboard_exercises', context['fretboardlocation_model'])
    with open(context['seed_data_path'], newline='') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        num_frets = int(next(reader)[0])
        num_strings = int(next(reader)[0])
        interval = {}
        base_notes = []
        for i in range(num_strings, 1, -1):
            interval[(i, i - 1)] = int(next(reader)[0])
        current_string = num_strings
        for fret in range(12):
            row = next(reader)
            note, _ = Note.objects.get_or_create(name=row[0], frequency=float(row[1]))
            FretboardLocation.objects.get_or_create(string=current_string, fret=fret, note=note)
            base_notes.append(note)
        for fret in range(12, num_frets + 1):
            base_note = base_notes[fret - 12]
            derived_note, _ = Note.objects.get_or_create(name=base_note.name, frequency=2*base_note.frequency)
            base_notes.append(derived_note)
            FretboardLocation.objects.get_or_create(string=current_string, fret=fret, note=derived_note)
        previous_string_notes = base_notes
        current_string_notes = []
        for string in range(current_string - 1, 0, -1):
            current_interval = interval[(string+1, string)]
            for fret in range(num_frets + 1):
                if fret + current_interval <= num_frets:
                    FretboardLocation.objects.get_or_create(string=string, fret=fret, note=previous_string_notes[fret+current_interval])
                    current_string_notes.append(previous_string_notes[fret+current_interval])
                elif fret - (12 - current_interval) >= 0:
                    base_note = previous_string_notes[fret - (12 - current_interval)]
                    derived_note, _ = Note.objects.get_or_create(name=base_note.name, frequency=2*base_note.frequency)
                    FretboardLocation.objects.get_or_create(string=string, fret=fret, note=derived_note)
                    current_string_notes.append(derived_note)
                else:
                    raise ConfigurationException("The seed file is not properly configured. The first 12 notes of the lowest string must be contained in the seed file.")
            previous_string_notes = current_string_notes
            current_string_notes = []


class ConfigurationException(Exception):
    pass


class ParametrizedRunPython(migrations.RunPython):
    '''
    A class inheriting from migrations.RunPython that allows kwargs to be passed along with the callable
    expected by RunPython. The additional kwargs will be passed to the callable.
    This class was taken from: https://stackoverflow.com/questions/62899229/django-data-migration-pass-argument-to-runpython
    '''
    def __init__(self, *args, **kwargs):
        self.context = kwargs.pop('context', {})
        super().__init__(*args, **kwargs)

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        from_state.clear_delayed_apps_cache()
        if router.allow_migrate(schema_editor.connection.alias, app_label, **self.hints):
            self.code(from_state.apps, schema_editor, **self.context)
