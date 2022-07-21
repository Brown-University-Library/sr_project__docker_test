##### (under construction)

temp...

COPY ./config/requirements.txt /code/  # copies the repo's requirements.txt file to the /code/ directory on the image
RUN pip install -r ./requirements.txt  # installs, into the image's root/global python environment, the required packages
COPY . /code/                          # copies all the repo code over to the /code/ directory (now with the /code/requirements.txt and the /code/config/requirements.txt)

---
---

### Glossary...

(terms sometimes used interchangeably in code, with clarifications)

- document / citation

    - There is no database 'document' object. Rather, a document is, conceptually, a `Citation` and associated `Reference` entries.

- record / item / reference

    - These are the same, the database contains `Reference` entries, each of which provide a linkage between a `Citation` entry and `Referent` entries. A `Reference` entry also contain transcription and other information.

- person / entrant / referent

    - An entrant and a referent are the same. The database contains `Referent` entries; a `Referent` is an individual mentioned in a `Reference`.

    - A `Referent` provides a linkage between a `Person` and a `Reference`.

    - The interface currently allows for relationships to be defined between `Referent` entries.

----

