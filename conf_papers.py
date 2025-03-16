"""
This script is used to get the submissions for the conference papers from OpenReview.
Reference: https://blog.csdn.net/qq_39517117/article/details/142959952
"""
import openreview
import json
import argparse

# read username and password from file
config = json.load(open('config.json'))
username = config['username']
password = config['password']

client = openreview.api.OpenReviewClient(
    baseurl='https://api2.openreview.net',
    username=username,
    password=password
)

def get_submissions(client, venue_id, status='all'):
    # Retrieve the venue group information
    venue_group = client.get_group(venue_id)
    
    # Define the mapping of status to the respective content field
    status_mapping = {
        "all": venue_group.content['submission_name']['value'],
        "accepted": venue_group.id,  # Assuming 'accepted' status doesn't have a direct field
        "under_review": venue_group.content['submission_venue_id']['value'],
        "withdrawn": venue_group.content['withdrawn_venue_id']['value'],
        "desk_rejected": venue_group.content['desk_rejected_venue_id']['value']
    }
    
    print(status_mapping)
    print("keys", venue_group.content.keys())

    # Fetch the corresponding submission invitation or venue ID
    if status in status_mapping:
        if status == "all":
            # Return all submissions regardless of their status
            return client.get_all_notes(invitation=f'{venue_id}/-/{status_mapping[status]}')
        
        # For all other statuses, use the content field 'venueid'
        return client.get_all_notes(content={'venueid': status_mapping[status]})
    
    raise ValueError(f"Invalid status: {status}. Valid options are: {list(status_mapping.keys())}")

def get_accepted_ratings(client, venue_id):
    
    venue_group = client.get_group(venue_id)
    submission_name = venue_group.content['submission_name']['value']
    submissions = client.get_all_notes(invitation=f'{venue_id}/-/{submission_name}', details='replies')
    
    review_name = venue_group.content['review_name']['value']

    print("key in submissions[0].content=", submissions[0].content.keys())
    print("key in submissions[0].details=", submissions[0].details.keys())

    data = []
    accepted_venues = ['ICLR 2025 Poster', 'ICLR 2025 Spotlight', 'ICLR 2025 Oral']
    important_keys = ['TLDR', 'abstract', 'authors', 'authorids', 'keywords', 'title', 'venue', 'primary_area', 'pdf']
    for s in submissions:
        
        venue = s.content['venue']['value']
        if venue not in accepted_venues:
            continue
        
        accepted_info = {key: (None if key not in s.content.keys() else s.content[key]['value']) for key in important_keys}
        accepted_info['forum'] = s.forum
        print("accepted_info['forum']=", accepted_info['forum'])
        
        ratings = []
        confidence = []
        s_reviews = []
        for reply in s.details['replies']:
            if f'{venue_id}/{submission_name}{s.number}/-/{review_name}' in reply['invitations']:
                s_reviews.append(openreview.api.Note.from_json(reply))
                ratings.append(s_reviews[-1].content['rating']['value'])
                confidence.append(s_reviews[-1].content['confidence']['value'])
        
        accepted_info['ratings'] = ratings
        accepted_info['confidence'] = confidence
        accepted_info['average_rating'] = sum(ratings) / len(ratings)
        
        data.append(accepted_info)
        
    print("len of data=", len(data))
    return data

if __name__ == "__main__":
    
    args = argparse.ArgumentParser()
    args.add_argument("--workshop", action='store_true', default=False)
    args.add_argument("--main", action='store_true', default=False)
    args = args.parse_args()
    
    get_venues = lambda client: client.get_group(id='venues').members
    venues = get_venues(client)
    print([ven for ven in venues if 'ICLR.cc/2025' in ven], '\n')
    # ['ICLR.cc/2025/Conference', 'ICLR.cc/2025/Workshop_Proposals', 'ICLR.cc/2025/BlogPosts', 'ICLR.cc/2025/Workshop/World_Models', 'ICLR.cc/2025/Workshop/FPI', 'ICLR.cc/2025/Workshop/ICBINB', 'ICLR.cc/2025/Workshop/GEM', 'ICLR.cc/2025/Workshop/HAIC', 'ICLR.cc/2025/Workshop/LLM_Reason_and_Plan', 'ICLR.cc/2025/Workshop/SCI-FM', 'ICLR.cc/2025/Workshop/AI4MAT', 'ICLR.cc/2025/Workshop/LMRL', 'ICLR.cc/2025/Workshop/Bi-Align', 'ICLR.cc/2025/Workshop/Financial_AI', 'ICLR.cc/2025/Workshop/VerifAI', 'ICLR.cc/2025/Workshop/SSI-FM', 'ICLR.cc/2025/Workshop/MLDPR', 'ICLR.cc/2025/Workshop/Re-Align', 'ICLR.cc/2025/Workshop/MCDC', 'ICLR.cc/2025/Workshop/FM-Wild', 'ICLR.cc/2025/Workshop/SCSL', 'ICLR.cc/2025/Workshop/DL4C', 'ICLR.cc/2025/Workshop/SCOPE', 'ICLR.cc/2025/Workshop/NFAM', 'ICLR.cc/2025/Workshop/DeLTa', 'ICLR.cc/2025/Workshop/AI4NA', 'ICLR.cc/2025/Workshop/QUESTION', 'ICLR.cc/2025/Workshop/SLLM', 'ICLR.cc/2025/Workshop/Data_Problems', 'ICLR.cc/2025/Workshop/MLMP', 'ICLR.cc/2025/Workshop/WSL', 'ICLR.cc/2025/Workshop/BuildingTrust', 'ICLR.cc/2025/Workshop/AgenticAI', 'ICLR.cc/2025/Workshop/WMARK', 'ICLR.cc/2025/Workshop/AI4CHL', 'ICLR.cc/2025/Workshop/XAI4Science', 'ICLR.cc/2025/Workshop/MLGenX', 'ICLR.cc/2025/Workshop/WRL', 'ICLR.cc/2025/Workshop/SynthData', 'ICLR.cc/2025/Workshop/EmbodiedAI']
    
    if args.main:
        
        venue_id = 'ICLR.cc/2025/Conference'
        
        reviews = get_accepted_ratings(client, venue_id)
        print("len of reviews=", len(reviews))
        
        with open('data/ICLR2025_main_accepted_ratings.json', 'w') as f:
            json.dump(reviews, f)
    
    if args.workshop:
        
        workshop_venues = [ven for ven in venues if 'ICLR.cc/2025/Workshop/' in ven]
        
        for venue_id in workshop_venues:
            
            print("venue_id=", venue_id)
            
            submissions = get_submissions(client, venue_id, 'all')
            print(len(submissions))
            
            if len(submissions) == 0:
                continue
            
            venue = []
            for data in submissions:
                accepted_venue = data.content['venue']['value']
                
                if accepted_venue not in venue:
                    venue.append(accepted_venue)

            print(venue)
            
            extracted_data = []
            important_keys = ['TLDR', 'abstract', 'authors', 'authorids', 'keywords', 'title', 'venue', 'pdf']
            for data in submissions:
                extracted_data.append({key: (None if key not in data.content.keys() else data.content[key]['value']) for key in important_keys})
                extracted_data[-1]['forum'] = data.forum
            
            # save the data to a file
            workshop_name = venue_id.split('/')[-1]
            with open(f'data/ICLR2025_workshop_{workshop_name}.json', 'w') as f:
                json.dump(extracted_data, f)
