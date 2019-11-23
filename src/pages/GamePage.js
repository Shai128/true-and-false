import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

export function GamePage(props){
  const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
     // height: 240,
    },
    button: {
        background: props =>
    props.color ='linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  border: 0,
  borderRadius: 3,
  paddingLeft: '0pt',
  boxShadow: props =>
    props.color = '0 3px 5px 2px rgba(33, 203, 243, .3)',
  color: 'white',
  height: 48,
    },
    
    }));
    const classes = useStyles();
    const game = props.location.game;
    return (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
         
          <Paper className={classes.paper}>
          <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography component="h2" variant="h3" justify="center">
              {game.name}
            </Typography>
            </Grid>
            <Grid item xs={12}>
            <Typography component="h4" variant="h4" justify="center">
              {game.date}
            </Typography>
            </Grid>   
            </Grid>  
            </Paper>
             

        </Container>
      );

};

