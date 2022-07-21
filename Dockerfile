# syntax=docker/dockerfile:1
FROM python:3
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /code
COPY ./config/requirements.txt /code/  # copies the repo's requirements.txt file to the /code/ directory on the image
RUN pip install -r ./requirements.txt  # installs, into the image's root/global python environment, the required packages
COPY . /code/                          # copies all the repo code over to the /code/ directory (now with the /code/requirements.txt and the /code/config/requirements.txt)

