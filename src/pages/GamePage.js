import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
/*
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
*/

import {useStyles as AppUseStyles} from './../App.js';
import Paper from '@material-ui/core/Paper';

export function GamePage(props){
    const classes = AppUseStyles();
    const game = props.location.game;
    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper} >
          <Paper>
            <Typography component="h1" variant="h2" justify="center">
              Game {game.date}
            </Typography>
            </Paper>
                    
          </div>          

        </Container>
      );

};

