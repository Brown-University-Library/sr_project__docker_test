##### (under construction)


### Docker notes...

- Adding     

        stdin_open: true # docker run -i
        tty: true        # docker run -t

    ...to the `docker-compose.yml` doesn't yield a nice interactive shell environment, but does keep the container running, such that connecting to it and running, say, `cat ./README.md`, then making a code-editor change to the README, then cat-ing it again, will show the change, confirming that the volume-configuration is working. (thanks Patrick!)

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

