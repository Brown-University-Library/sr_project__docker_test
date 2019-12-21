# -*- coding: utf-8 -*-

import datetime, json, logging, os, pprint

from disa_app import settings_app
from disa_app.models_sqlalchemy import Person
from django.conf import settings


log = logging.getLogger(__name__)


def query_people():
    """ Queries db for people.
        Called by views.people()
        Resources:
        - <https://stackoverflow.com/questions/19406859/sqlalchemy-convert-select-query-result-to-a-list-of-dicts/20078977>
        - <https://stackoverflow.com/questions/2828248/sqlalchemy-returns-tuple-not-dictionary>
        """
    from sqlalchemy import Column, Integer, String, ForeignKey
    from sqlalchemy import create_engine
    engine = create_engine( settings_app.DB_URL, echo=True )
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()
    from sqlalchemy.orm import relationship
    from sqlalchemy.orm import sessionmaker
    Session = sessionmaker(bind = engine)
    session = Session()
    resultset: List(sqlalchemy.util._collections.result) = session.query(
        Person.id, Person.first_name, Person.last_name, Person.comments ).all()
    log.debug( f'type(resultset), `{type(resultset)}`' )
    people: List(dict) = [ dict( zip(row.keys(), row) ) for row in resultset ]  # enables returned list to be jsonified
    log.debug( f'people, ```{pprint.pformat(people)}```' )
    return people



# db = SQLAlchemy(app)
# db_url = settings_app.DB_URL
# people = []
# for (prsn, rfrnt) in db.session.query( models.Person, models.Referent ).filter( models.Person.id==models.Referent.id ).all():
#     sex = rfrnt.sex if rfrnt.sex else "Not Listed"
#     age = rfrnt.age if rfrnt.age else "Not Listed"
#     race = None
#     try:
#         race = rfrnt.races[0].name
#     except:
#         log.debug( 'no race-name; races, ```{rfrnt.races}```' )
#     race = race if race else "Not Listed"
#     temp_demographic = f'age, `{age}`; sex, `{sex}`; race, `{race}`'
#     # prsn.tmp_dmgrphc = temp_demographic
#     # prsn.last_name = f'{prsn.last_name} ({temp_str})'
#     prsn.calc_sex = sex
#     prsn.calc_age = age
#     prsn.calc_race = race
#     people.append( prsn )
# p = people[1]
# log.debug( f'p.__dict__, ```{p.__dict__}```' )

