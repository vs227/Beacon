initialy in Backend have to setup the virtual environment

For new devs after cloning go the backend folder bash these one by one:
cd Backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

run the backend server bash:
uvicorn main:app --reload

run the testing frontend html :
open index.html in your browser

setup .env file (refer .env.example)

create supabase account and setup the database named Beacon and create a table #schema is given in the schema.txt then update .env

+ also update the github url part by geting credentials from the developer settings of github