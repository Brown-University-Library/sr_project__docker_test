# -*- coding: utf-8 -*-

import logging, pprint

from disa_app import settings_app
from django.conf import settings as project_settings
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect


log = logging.getLogger(__name__)


def check_credentials_on_post( submitted_username, submitted_password ):
    """ Checks the POSTed username and password.
        Called by views.browse_tabulator() """
    log.debug( 'starting check_credentials' )
    assert type(submitted_username) == str
    assert type(submitted_password) == str
    credentials_valid = False
    for user_pass in settings_app.BASIC_AUTH_LIST:
        ( good_username, good_password ) = list( user_pass.items() )[0]
        assert type(good_username) == str
        assert type(good_password) == str
        if received_username == good_username and received_password == good_password:
            credentials_valid = True
            break
    return credentials_valid


def prepare_self_redirect_on_post():
    """ Handles POSTed username and password.
        Called by views.browse_tabulator() """
    log.debug( 'starting prepare_good_post_response()' )
    redirect_url = reverse( 'browse_url' )
    log.debug( f'redirect_url, ```{redirect_url}```' )
    resp = HttpResponseRedirect( redirect_url )
    return resp


def check_browse_logged_in_on_get( session_items, is_logged_in_via_django ):
    """ Checks logged-in status from session info on a GET.
        Called by views.browse_tabulator() """
    log.debug( f'session_items start, ``{pprint.pformat(session_items)}``' )
    log.debug( f'type(session_items), ``{type(session_items)}``' )
    log.debug( f'is_logged_in_via_django start, ``{is_logged_in_via_django}``' )
    log.debug( f'type(is_logged_in_via_django), ``{type(is_logged_in_via_django)}``' )
    # assert type( session_items ) == type( {}.items() )
    assert type( session_items ) == dict
    assert type( is_logged_in_via_django ) == bool
    is_logged_in = False
    if is_logged_in_via_django:
        is_logged_in = True
    elif session_items.get( 'browse_logged_in', "no" ) == "yes":
        is_logged_in = True
    return is_logged_in


def prepare_logged_in_get_context( django_is_authenticated ):
    """ Prepares context.
        Called by views.browse_tabulator() """
    assert type(django_is_authenticated) == bool
    context = {
        'browse_json_url': reverse( 'browse_json_proxy_url' ),
        'info_image_url': f'{project_settings.STATIC_URL}images/info.png',
        'browse_logged_in': True,
        'user_is_authenticated': django_is_authenticated,
        'browse_logged_in': True,  # so `browse-logout` button shows
        }
    log.debug( f'context, ``{pprint.pformat(context)}``' )
    return context


def prepare_get_response( context, json_param, template_name ):
    """ Prepares response on get, whether logged-in or not-logged-in.
        Called by views.browse_tabulator() """
    assert type( context ) == dict
    assert type( json_param ) == str
    assert type( template_name ) == str
    if json_param == 'json':
        resp = HttpResponse( json.dumps(context, sort_keys=True, indent=2), content_type='application/json; charset=utf-8' )
    else:
        resp = render( request, 'disa_app_templates/browse_tabulator.html', context )
    return resp


def prepare_non_logged_in_get_context( errant_submitted_username, errant_submitted_password ):
    """ Prepares context.
        Called by views.browse_tabulator() """
    assert type( errant_submitted_username ) == str
    assert type( errant_submitted_password ) == str
    context = {
        'browse_login_error': True,
        'browse_login_username': errant_submitted_username,
        'browse_login_password': errant_submitted_password,
        'LOGIN_PROBLEM_EMAIL': LOGIN_PROBLEM_EMAIL,
    }
    log.debug( f'context, ``{pprint.pformat(context)}``' )
    return context
