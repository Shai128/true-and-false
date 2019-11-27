import React from 'react';
import clsx from 'clsx';

import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListIcon from '@material-ui/icons/List';
import GamesIcon from '@material-ui/icons/Games';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import HomeIcon from '@material-ui/icons/Home';
import Button from '@material-ui/core/Button';
import App from './../App.js'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    Redirect,
    useHistory,
  } from "react-router-dom";
  import { createBrowserHistory } from "history";

  import {GamesListPage as GamesList} from './GamesList.js';

import {LoginScreenHome as Home} from './LoginScreenHome.js';

import {MyProfile} from './MyProfile.js';
import {MySentences} from './MySentences.js';
import {getCurrentUserFromSession as getCurrentUser} from './../user';


const drawerWidth = 240;
const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
    },
    toolbar: {
      paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    menuButtonHidden: {
      display: 'none',
    },
    title: {
      flexGrow: 1,
    },
    drawerPaper: {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      height: '100vh',
      overflow: 'auto',
    },
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
      height: 240,
    },
  }));



export function LoginScreenRouter(){

  return(
  <Router>
  <Switch>
    
  
        
  <Route exact path={`/`}>
            <App />
          </Route>

  <Route path={'/LoginScreen'}>  
  <LoginScreen />
  </Route>
  </Switch>


  </Router>
  );
}
function LoginScreen(props){
  const [currentUser, setCurrentUser] = React.useState({});
    getCurrentUser(currentUser, setCurrentUser);
    const [open, setOpen] = React.useState(false);
    const handleDrawerOpen = () => {
      setOpen(true);
    };
    const handleDrawerClose = () => {
      setOpen(false);
    };
    const classes = useStyles();
    let history = useHistory();

    const logout = ()=>{
      history.push("/"); // moves to main page (localhost:3000)
      //todo: implement logout
    }
    let { path, url } = useRouteMatch();


    const listItems=(
        <div>              
    <Link to={{
      pathname:`${url}/Home`,
      user: currentUser
      }}> 
    <ListItem button>
     <ListItemIcon> 
         <HomeIcon /> 
         </ListItemIcon> 
         <ListItemText primary="Home" />
          </ListItem> 
          </Link>

        <Link to={{
          pathname: `${url}/MyProfile`,
          user: currentUser
        }}>      
            <ListItem button>
              <ListItemIcon>
                  <AccountCircleIcon />
              </ListItemIcon>
            <ListItemText primary="My Profile" />
            </ListItem>
            </Link>

            <Link to={{
              pathname: `${url}/MySentences`,
              user: currentUser
            }}>      
            <ListItem button>
              <ListItemIcon>
                  <ListIcon />
              </ListItemIcon>
            <ListItemText primary="My Sentences" />
            </ListItem>
            </Link>


        <Link to={{
          pathname:`${url}/GamesList`,
          user: currentUser
        }}>      
          <ListItem button>
              <ListItemIcon>
                  <GamesIcon />
              </ListItemIcon>
          
            <ListItemText primary="Games List" />
            </ListItem>
            </Link>
        </div>
      );


    return(
      <div>
        <Router>
 <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
  <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
    <Typography variant="h6" className={classes.title}>
    Two Truths and One Lie
   </Typography>
   <Switch>
     
   </Switch>
   <Route exact path={'/'} component = {App}/>  

    <Button color="inherit"
    onClick={logout}>
      Log Out
      </Button>

  </Toolbar>
  
</AppBar>

<Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >

<div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>{listItems}</List>
        <Divider />
        </Drawer>
        <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        
        <RedirectToHomeIfNeeded url={url} />
        <Switch>  
          
        
        <Route exact path={`/`}>
            <App />
          </Route>

         
          <Route path={`${path}/Home`}>
            <Home />
          </Route>

          <Route path={`${path}/GamesList`}>
            <GamesList />
          </Route>


          <Route path={`${path}/MyProfile`} component ={MyProfile} />


          <Route path={`${path}/MySentences`}>
            <MySentences />
          </Route>

        </Switch>
        </main>

        </div>
      </Router>
      </div>
    );
    
}
function RedirectToHomeIfNeeded(props){
    const history = createBrowserHistory();
    let url =  props.url;
    const path_array = history.location.pathname.split("/");
    const length = path_array.length;
    const this_page_name = 'LoginScreen';
    if(path_array[length-1] === this_page_name || 
        (path_array[length-2] === this_page_name&&path_array[length-1]===''))
        return (<Redirect to={`${url}/Home`}  />);
    else 
        return (<div></div>);
}