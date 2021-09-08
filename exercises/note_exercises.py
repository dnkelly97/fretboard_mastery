import random


OPEN_STRING_NOTES = ['', 'E', 'B', 'G', 'D', 'A', 'E']
STRINGS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth']


def run_open_string_exercise(string_no=None, quit_exercise=False):
    if not quit_exercise:
        print()
        if string_no is None:
            string_no = random.randint(1, 6)
        entry = input(f"{STRINGS[string_no]} string\n")
        result, string_no, quit_exercise = evaluate_entry(entry, string_no)
        print(result)
        run_open_string_exercise(string_no, quit_exercise)


def evaluate_entry(entry, string_no, fret=0):
    quit_exercise = False
    try:
        assert(OPEN_STRING_NOTES[string_no] == entry)
        result = 'CORRECT'
        string_no = None
    except AssertionError:
        if entry.lower() == 'q':
            result = 'FINISHED'
            quit_exercise = True
        elif entry not in OPEN_STRING_NOTES[1:]:
            result = "KEY ERROR"
        else:
            result = 'INCORRECT'
    finally:
        return result, string_no, quit_exercise

