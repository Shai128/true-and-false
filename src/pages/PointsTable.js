import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { reject } from 'q';
import { useState } from 'react';
import Button from '@material-ui/core/Button';
import {useHistory} from "react-router-dom";
import { isUndefined, server } from './../Utils.js'

// const useStyles = makeStyles({
//     table: {
//       minWidth: 650,
//     },
//   });

const okStatus = 200;

function createData(nickName, points) {
    return {position: 0, nickName, points};
}

export function PointsTable(props) {
    /*
    props:
    roomId
    */

    console.log('you have gotten to Points Table!!!', props.location)
    // const classes = useStyles();

    const [rows, setRows] = useState([]);
    let history = useHistory();
    //props = {roomId: 1}

    fetch(server + '/userList/' + props.location.roomId, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
    }).then((response) => {
      if (response.status !== okStatus) {
        reject(response.status)
      } else {
        return new Promise(function (resolve, reject) {
          resolve(response.json());
        })
      }
    }).then(data => {
        console.log("data: ", data, rows)
        if (rows.length === 0 && data.PlayersAvailable !== undefined && data.PlayersUnAvailable !== undefined)
        {
            var newPlayersAvailable = JSON.parse(JSON.stringify(data.PlayersAvailable));
            var newPlayersUnAvailable = JSON.parse(JSON.stringify(data.PlayersUnAvailable));
            var players = newPlayersAvailable.concat(newPlayersUnAvailable)
            players = players.map(user => createData(user.nickname, user.score))
            players = players.sort(function(a, b){return b.points - a.points})
            for (let pos = 1; pos <= players.length; pos++){
                players[pos-1].position = pos
            }
            setRows(players)
        }
    }, fail_status => {
      console.log("failed. status: ", fail_status)
    })
    
    return(
        <Grid container justify='center' spacing={2}>
            <Grid item xs={6}>
                <TableContainer component={Paper} align='center'>
                    {/* className={classes.table} */}
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Position</TableCell>
                                <TableCell align="center">Nick Name</TableCell>
                                <TableCell align="center">Points</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.position}>
                                <TableCell align="center" component="th" scope="row">
                                    {row.position}
                                </TableCell>
                                <TableCell align="center">{row.nickName}</TableCell>
                                <TableCell align="center">{row.points}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item xs={12} align='center'>
                <Button id="pointsTableBTN" variant="contained" color="primary"
                    onClick={()=>{history.push({
                    pathname: '/LoginScreen/JoinGame',
                    })}}
                    >
                    Back to Room Page
                </Button>
            </Grid>
        </Grid>
    )
}