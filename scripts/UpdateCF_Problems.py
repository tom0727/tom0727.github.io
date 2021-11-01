import json
import os
import sys
import time
import requests

FILE_PATH = "public/contests.json"
INVALID_ID = {1410, 1414, 1412, 1258, 1226, 1224, 1222, 1094, 1050, 1049, 1048, 905, 885, 874, 857, 826, 728, 726, 693, 630}


'''
Format of contest_list_all (list): 
    Each Element is a dict, containing the following:
    "id": The id of contest (e.g. 1536)
    "type": The type of the contest (e.g. "Div. 1", "Div. 1 + Div. 2", "Global", "Others")
    "name": The name of the contest
    "problems": A list, each element is of format: 
        {"contestId": 1536, "index": "B", "name": "Omkar and Bad Story", "rating":1200, "Solved": 1234, "Attempted": 5555}
        (rating might be optional)
    "sub": Boolean, whether it has some problem (1) or not (0).
'''


contest_id_dict = dict()


def process(p):
    p = {k : v for k,v in p.items() if k in ["contestId", "index", "name", "rating"]}
    p["solved"] = 0
    p["attempted"] = 0
    p["sub"] = 0
    return p


def load_contest_json():
    print(f"Current file size = {os.path.getsize(FILE_PATH)}")
    global contest_id_dict
    contest_list_all = json.load(open(FILE_PATH))
    for contest_info in contest_list_all:
        if not contest_info:  # if it contains some None value
            print("none")
            continue
        id = contest_info["id"]
        contest_id_dict[id] = contest_info


def load_contest_byid(id):
    print(f"loading contest {id}...")
    url = f"https://codeforces.com/api/contest.standings?contestId={id}&showUnofficial=false"
    res = requests.get(url)
    if not res:
        print(f"Error loading contest {id}, status code = {res.status_code}")
        return None
    info = res.json()

    name = info["result"]["contest"]["name"]
    type = "Others"
    if "Global" in name:
        type = "Global"
    elif "Educational" in name:
        type = "Educational"
    elif "Div. 1 + Div. 2" in name:
        type = "Div1 + Div2"
    elif "Div. 1" in name:
        type = "Div1"
    elif "Div. 2" in name:
        type = "Div2"
    elif "Div. 3" in name:
        type = "Div3"


    problem_list = info["result"]["problems"]
    problem_list = list(map(process, problem_list))

    if len(problem_list) == 0 or "rating" not in problem_list[0]:
        return None

    for row in info["result"]["rows"]:
        problem_result = row["problemResults"]
        for i in range(len(problem_result)):
            if (problem_result[i]["points"] > 0):
                problem_list[i]["attempted"] += 1 + problem_result[i]["rejectedAttemptCount"]
                problem_list[i]["solved"] += 1

    contest_obj = dict()
    contest_obj["id"] = id
    contest_obj["type"] = type
    contest_obj["problems"] = problem_list
    contest_obj["name"] = name
    return contest_obj


def filter_contest_helper(contest_result):

    if contest_result["phase"] == "FINISHED":
        if contest_result["type"] == "CF":
            return True
        if contest_result["type"] == "ICPC" and ("Div. 3" in contest_result["name"] or "Div.3" in contest_result["name"]):
            return True
        if contest_result["type"] == "ICPC" and "Educational" in contest_result["name"]:
            return True

        return False

    return False



def load_contest_all():
    try_count = 0

    while try_count < 5:
        try:
            url = "https://codeforces.com/api/contest.list"
            res = requests.get(url)
            contest_all_info = res.json()
            break
        except ValueError as e:
            try_count += 1
            print(f"An error occurred, Error msg: {e}")
            time.sleep(60)  # wait for 1 minutes
    else:
        sys.exit(0)

    contest_list_all = []
    if contest_all_info["status"] == "OK":
        contest_all_info = contest_all_info["result"]
        # contest_all_info = list(filter((lambda obj : obj["phase"] == "FINISHED" and (obj["type"] == "CF" or (obj["type"] == "ICPC" and "Div. 3" in obj["name"]))), contest_all_info))
        contest_all_info = list(filter(filter_contest_helper, contest_all_info))
        for contest in contest_all_info:
            id = contest["id"]
            if id in INVALID_ID:  # ignore all invalid ID
                continue

            if id not in contest_id_dict:
                contest_obj = load_contest_byid(id)
                if contest_obj:   # load the contest only if it exists
                    contest_id_dict[id] = contest_obj
            else:
                contest_obj = contest_id_dict[id]  # directly load the contest object from contest.json


            if contest_obj:   # only append valid info
                if "sub" not in contest_obj:
                    sub = 0
                    for problem in contest_obj["problems"]:
                        if len(problem["index"]) > 1:
                            sub = 1
                    contest_obj["sub"] = sub

                contest_list_all.append(contest_obj)

        with open(FILE_PATH, "w") as outfile:
            json.dump(contest_list_all, outfile)

        print(f"After update, file size = {os.path.getsize(FILE_PATH)}")

    else:
        raise Exception("Load contest list failed.")


if __name__ == "__main__":
    load_contest_json()
    load_contest_all()
