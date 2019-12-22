import React, { useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddCircleTwoToneIcon from '@material-ui/icons/AddCircleTwoTone';
import IconButton from '@material-ui/core/IconButton';
import { useStyles as AppUseStyles } from './../App.js';
import DeleteTwoToneIcon from '@material-ui/icons/DeleteTwoTone';

import { updateUserToDB, getCurrentUserFromSession, userIsUpdated, getUserFromProps } from './../user.js'
import { DisplayLoading } from './../PagesUtils';
import {
  useHistory,
} from "react-router-dom";
const useButtonStyles = makeStyles({
  root: {
    background: props =>
      props.color = 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    border: 0,
    borderRadius: 3,
    paddingLeft: '0pt',
    boxShadow: props =>
      props.color = '0 3px 5px 2px rgba(33, 203, 243, .3)',
    color: 'white',
    height: 48,
    //padding: '0 30px',
    //margin: 8,
  },
});

export function MySentences(props) {
  let history = useHistory();
  const classes = AppUseStyles();
  const buttonClasses = useButtonStyles();
  const [user, setUser] = useState(getUserFromProps(props));
  const [truths, setTruths] = useState(user.true_sentences);
  const [lies, setLies] = useState(user.false_sentences);
  getCurrentUserFromSession(user, setUser, (user) => { setTruths(user.true_sentences); setLies(user.false_sentences) });
  if (!userIsUpdated(user)) {
    return (<DisplayLoading />);
  }
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper} >
        <Typography component="h2" variant="h3" justify="center">
          My Sentences
          </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} />

          <Grid item l={12} >
            <Typography component="h5" variant="h6" justify="center">
              Truth Sentences
            </Typography>
            <Divider />
          </Grid>



          <Grid item xs={12} >
            <GetSentencesComponentsByList sentences={truths} setSentences={setTruths} />
          </Grid>
          <Grid item l={12} >
            <Typography component="h5" variant="h6" justify="center">
              False Sentences
            </Typography>
            <Divider />
          </Grid>
          <Grid item xs={12} >
            <GetSentencesComponentsByList sentences={lies} setSentences={setLies} />
          </Grid>



          <Grid item xs={12} >

            <Button
              className={buttonClasses.root}
              fullWidth
              type="submit"
              onClick={() => {
                if (user.true_sentences.length === 0 && user.false_sentences.length === 0)
                  history.push('/LoginScreen');
                let user_copy = JSON.parse(JSON.stringify(user));
                user_copy.true_sentences = truths;
                user_copy.false_sentences = lies;
                setUser(user_copy);
                updateUserToDB(user_copy);
              }
              }>
              Save
              </Button>

          </Grid>
        </Grid>

      </div>


    </Container>

  );

}
/*
function getUser(){
    return {
        email: "email@gmail.com",
        nickName: 'nickname',
        password: 'password',
        truths: [{id: 0, value:"My name is Alon"}, {id: 1,value:"I have Pizza"}],
        lies: [{id:0, value:"I love computer science"}, {id:1, value:"this is a lie"}]
    }
}
*/
function GetSentencesComponentsByList(props) {
  const listStyles = makeStyles(theme => ({
    listItem: {
      width: '100%',
      border: '0',
      borderRadius: 3,
      color: 'white',
      height: 48,
      //padding: '0 30px',
      //margin: '5px',

      display: 'flex',
      //flexWrap: 'wrap',
      marginBottom: theme.spacing(2),
      paddingLeft: '0pt'
    },
    list: {
      width: '100%',
      marginBottom: theme.spacing(2),
      margin: '5px'
    },
    textField: {
      borderRadius: 3,
      width: '100%',
      paddingBottom: 0,
      marginTop: 0,
      fontWeight: 500,
      marginBottom: theme.spacing(2),
      //background: '#2193b0',  /* fallback for old browsers */
      //background: '-webkit-linear-gradient(to right, #6dd5ed, #2193b0)', /* Chrome 10-25, Safari 5.1-6 */
      background: 'linear-gradient(to right, #000428, #004e92);', /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    },
    white: {
      color: 'white'
    },
  }));

  const classes = listStyles();
  const sentences = props.sentences;

  const setSentences = props.setSentences;
  //const [sentences, setSentences] = useState(props.sentences);
  const handleAddSentence = () => {
    setSentences(sentences.concat({ id: sentences.length, value: '' }));
  };
  const handledeleteSentence = (id) => {
    //removing the last item
    let new_array = sentences.slice();
    new_array.splice(id, 1);

    for (let i = id; i < new_array.length; i++) {
      new_array[i].id -= 1;
    }

    setSentences(new_array);
  }
  return (
    <div>
      <List className={classes.list}>

        {sentences.map(({ id, value }) => (
          <ListItem className={classes.listItem} key={id} alignItems='flex-start'>

            <Grid container spacing={2}>
              <Grid item xs={10}>
                <TextField
                  className={classes.textField}
                  variant="filled"
                  fullWidth
                  label={'Sentence ' + (id + 1)}
                  value={value}
                  InputProps={{ className: classes.white }}
                  onChange={(event) => {
                    let new_sentences = sentences.slice();
                    new_sentences[id].value = event.target.value;
                    setSentences(new_sentences);
                  }
                  }
                />
              </Grid>
              <Grid item xs={2}>

                <IconButton
                  style={{ justifyContent: 'center', width: '10%' }}
                  edge="start"
                  color="primary"
                  aria-label="open drawer"
                  onClick={() => { handledeleteSentence(id) }}
                >
                  <DeleteTwoToneIcon />
                </IconButton>

              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
      <Grid container spacing={2}>
        <Grid item xs={12} style={{ justifyContent: 'center' }}>
          <IconButton
            style={{ justifyContent: 'center', width: '100%' }}
            edge="start"
            color="primary"
            aria-label="open drawer"
            onClick={handleAddSentence}
          >
            <AddCircleTwoToneIcon />
          </IconButton>
        </Grid>
      </Grid>
    </div>
  );
}

