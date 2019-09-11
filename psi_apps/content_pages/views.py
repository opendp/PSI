from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.urls import reverse
from django.conf import settings
from django.shortcuts import render

import json

from psi_apps.content_pages.models import KEY_SUCCESS, KEY_DATA, KEY_MESSAGE


default_user_groups = [
    {
        "groupId": 1,
        "usernames": [
            "dev_admin", "test"
        ],
        "maximumEpsilon": .1,
        "privacyDefinition": {}
    },
    {
        "groupId": 2,
        "usernames": [
            "test_user"
        ]
    }
]

default_datasets = [
    {
        "datasetId": 1,
        "name": "PUMS",
        "records": 2000,
        "variables": [
            {
                "name": "age",
                "metadata": {},
                "metadataDefault": {
                    "type": "numeric",
                    "minimum": 0,
                    "maximum": 100
                }
            },
            {
                "name": "educ",
                "metadata": {},
                "metadataDefault": {
                    "type": "numeric",
                    "minimum": 0,
                    "maximum": 12
                }
            },
            {
                "name": "sex",
                "metadata": {},
                "metadataDefault": {
                    "type": "categorical",
                    "categories": [0, 1]
                }
            }
        ]
    }
]

default_workspaces = [
    {
        "workspaceId": 1,
        "datasetId": 1,
        "userGroupIds": [1, 2],
        "analysis": [
            {
                "nodeId": 1,
                "name": "add",
                "children": [
                    {"dataset": "PUMS", "variable": "age"},
                    {"dataset": "PUMS", "variable": "educ"}
                ]
            },
            {
                "nodeId": 2,
                "name": "mean",
                "children": [{"id": 1}],
                "metadata": {}
            },
            {
                "nodeId": 3,
                "name": "mean",
                "children": [
                    {"dataset": "PUMS", "variable": "sex"}
                ]
            }
        ]
    }
]


@login_required(login_url='login')
def application(request):
    """Return the vue application template"""
    info_dict = {
        'FLASK_SVC_URL': settings.FLASK_SVC_URL,
        'CONTENT_PAGES_BASE_URL': reverse('viewContentPageBase'),
        'USER_NAME': request.user.username
    }

    return render(request,
                  'application.html',
                  info_dict)


@login_required(login_url='login')
def list_workspaces(request):
    """list workspaces available to the user"""
    username = request.user.username
    user_groups = {}
    for group in default_user_groups:
        if username in group['usernames']:
            user_groups[group['groupId']] = group

    def find_user_group(group_ids):
        for group_id in group_ids:
            if group_id in user_groups:
                return group_id

    candidates = []
    for workspace in default_workspaces:
        parent_group_id = find_user_group(workspace['userGroupIds'])
        if parent_group_id is not None:
            candidates.append({"workspace": workspace, "groupId": parent_group_id})

    listing_data = [{
        "workspaceId": candidate['workspace']['workspaceId'],
        "datasetId": candidate['workspace']['datasetId'],
        "analysis": candidate['workspace']['analysis'],
        "userGroup": user_groups[candidate['groupId']]
    } for candidate in candidates]

    return JsonResponse({
        KEY_SUCCESS: True,
        KEY_DATA: listing_data,
        KEY_MESSAGE: 'datasets loaded successfully'
    })


@login_required(login_url='login')
def get_workspace(request):
    """get workspace by id"""
    json_data = json.loads(request.body)
    workspace_id = json_data['workspaceId']
    username = request.user.username

    user_groups = {}
    for group in default_user_groups:
        if username in group['usernames']:
            user_groups[group['groupId']] = group

    workspace = next((i for i in default_workspaces if i['workspaceId'] == workspace_id), None)
    if workspace is None:
        return JsonResponse({
            KEY_SUCCESS: False,
            KEY_MESSAGE: f"no workspace found with workspace id {workspace_id}"
        })

    user_group_id = next((i for i in workspace['userGroupIds'] if i in user_groups), None)
    if user_group_id is None:
        return JsonResponse({
            KEY_SUCCESS: False,
            KEY_MESSAGE: f"not authorized to view workspace id {workspace_id}"
        })
    user_group = user_groups[user_group_id]

    dataset = next((i for i in default_datasets if i['datasetId'] == workspace['datasetId']), None)
    if dataset is None:
        return JsonResponse({
            KEY_SUCCESS: False,
            KEY_MESSAGE: f"no dataset id {workspace['datasetId']} found for workspace {workspace_id}"
        })

    return JsonResponse({
        KEY_SUCCESS: True,
        KEY_MESSAGE: "workspace succesfully retrieved",
        KEY_DATA: {
            "analysis": workspace['analysis'],
            "user_group": user_group,
            "dataset": dataset
        }
    })
