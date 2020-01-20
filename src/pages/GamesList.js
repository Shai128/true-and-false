import React, { useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import MaterialTable from 'material-table';

import { useStyles as AppUseStyles } from '../App.js';
import { GamePage } from './GamePage.js'
import {
  useRouteMatch,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";

import { DisplayLoading } from '../PagesUtils.js';
import { getUserFromProps, getCurrentUserFromSession, userIsUpdated } from '../user.js';


import { forwardRef } from 'react';
import Grid from '@material-ui/core/Grid';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};


export function GamesListPage(props) {
  let { path, url } = useRouteMatch();

  return (
    <Switch>

      <Route exact path={path}>
        <Home path={path} url={url} user={props.user} />
      </Route>

      <Route path={`${path}/GamePage/:id`} exact component={GamePage} />

    </Switch>
  );

};


function Home(props) {
  const classes = AppUseStyles();
  let url = props.url;
  const [user, setUser] = useState(getUserFromProps(props));
  getCurrentUserFromSession(user, setUser)
  if (!userIsUpdated(user)) {
    return (<DisplayLoading />)
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper} >
        <Typography component="h1" variant="h2" justify="center">
          Games List
            </Typography>

        {/*<GetGamesComponents user={user} url={url} />*/}
        <GamesList user={user} games={user.gameHistory} url={url} />
      </div>



    </Container>
  );
}

function GamesList(props) {
  const mapFunc = (game) => {
    return {
      ...game,
      players_count: game.users_in_room.length,
      id: props.games.indexOf(game),
    }
  }
  var games = props.games.map(mapFunc);
  games.reverse();
  const cellStyle = {
    //width: 50,
    //maxWidth: 70,
    height: 80
  }
  const headerStyle = {
    //width: 50,
    //maxWidth: 80
  }
  let history = useHistory();
  return (
    <Grid Container>
      <Grid item xs={12}>
      <div style={{ height: '240', marginTop: 10, marginLeft:30}}>
      <MaterialTable
        title="Games"
        icons={tableIcons}
        columns={[
          {
            title: 'Name', field: 'room_name', cellStyle: cellStyle,
            headerStyle: headerStyle
          },
          {
            title: 'Date', field: 'date', cellStyle:
              cellStyle
            ,
            headerStyle:
              headerStyle

          },
          {
            title: 'Players Count', field: 'players_count', cellStyle:
              cellStyle
            ,
            headerStyle:
              headerStyle
          },]}
          data = { games }
        actions = {
            [{
              icon: ()=>{return(<ArrowForwardIcon />)}, tooltip: 'Go To Game Page',
              onClick: (event, rowData) => {history.push('/LoginScreen/Home/GamePage/'+rowData.id)}
            },
            /*{
              icon: ()=>{return(<EqualizerIcon />)}, tooltip: 'Go To Statistics Page',
              onClick: (event, rowData) => {history.push('/LoginScreen/Home/Statistics/'+rowData.id)}
            }*/]}
          />
    </div>
      </Grid>
    </Grid>
    
  
    )
  }
  
  /*
function GetGamesComponents(props) {
        let url = props.url;
    
      return (
    
    <Box mt={5} m={1}>
        {
          <Typography variant="h5" component="h3" justify="center">
            Games I Created
    </Typography>
        }
        <GetCreatedGamesComponents user={props.user} url={url} />
        {
          <Typography variant="h5" component="h3">
            Games I Was Participated In
    </Typography>

          <GetParticipatedGamesComponents user={props.user} url={url} />

      }
      </Box>

      );
    
    }
function GetCreatedGamesComponents(props) {
  return (<PrintGames classes={AppUseStyles()} games={props.user.gameHistory} url={props.url} />);
    }
function GetParticipatedGamesComponents(props) {
  return (<PrintGames classes={AppUseStyles()} games={getParticipatedGames()} url={props.url} />);
    }
    */
    
