import datetime

def today():
    return datetime.datetime.today()

def month_day():
    return datetime.datetime.today().strftime('%B/%d')