import React, {useEffect} from 'react';
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
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import Popup from "reactjs-popup";
import Container from '@material-ui/core/Container';
import ChatIcon from '@material-ui/icons/Chat';

import App from './../App.js'
import {
    //BrowserRouter as Router,
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
import {userIsUpdated,getCurrentUserFromDB ,getUserFromProps, logOut, socket, resetUnreadMessages, updateUserInLocalStorage} from './../user';
import {DisplayLoading, PrintMessages} from './../PagesUtils';
import { Chat } from './Chat.js';
import {SignIn} from './../App.js'
import {ChatLobby} from './ChatLobby.js';
import {JoinGame} from './JoinGame.js'
import {TheGame} from './TheGame.js'
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
  <Switch>
    
  <Route path ={'/SignIn'} component={SignIn} />
  
  <Route exact path={`/`}>
            <App />
          </Route>

  <Route path={'/LoginScreen'}>  
  <LoginScreen />
  </Route>
  <Route path={`/JoinGame`} exact component={JoinGame} />
  <Route path="/TheGame" exact component={TheGame}/>

  </Switch>


);
}
function LoginScreen(props){
  const [currentUser, setCurrentUser] = React.useState(getUserFromProps(props));
  const [unreadMessages, setUnreadMessages] = React.useState([]);
  const [unRegisteredUser, setUnRegisteredUser] = React.useState(false);
  if(!userIsUpdated(currentUser))
    getCurrentUserFromDB(setCurrentUser, (u)=>{setUnreadMessages(u.unReadMessages)}, ()=>{setUnRegisteredUser(true)});
  const [pageChange, setPageChange] = React.useState(false);


  let browserHistory = createBrowserHistory();
  
  let history = useHistory();

  const setSockets = (location)=>{
    socket.off(currentUser.email+'_chat_notification');
    socket.on(currentUser.email+'_chat_notification', function(data){
      const path_array = location.pathname.split("/");
      console.log('current location: ', location);

      var other_user_email = path_array[path_array.length-1];
      if(path_array.length>1 && data.user.email === other_user_email && path_array[path_array.length-2] === 'ChatRoom')
        return;
      var new_message = {
        authorEmail: data.user.email,
        authorName: data.authorName,
        messageContent: data.messageContent
      };
      setUnreadMessages(unreadMessages.concat(new_message));
      let user_copy = currentUser;
      user_copy.unReadMessages = unreadMessages.concat(new_message);
      updateUserInLocalStorage(user_copy);
  })  
}
browserHistory.listen((location, action) => {
  // location is an object like window.location
  setSockets(location);
  });

  useEffect(() => {
    if(!userIsUpdated(currentUser))
      return;
    setSockets(browserHistory.location);   
    });
  const [open, setOpen] = React.useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const classes = useStyles();

  const logout = ()=>{
    history.push("/"); // moves to main page (localhost:3000)
    logOut();
  }
  let { path, url } = useRouteMatch();
  const onPageChange = ()=>{setPageChange(!pageChange)}

    const listItems=(
        <div>              
    <Link to={{
      pathname:`${url}/Home`,
      user: currentUser
      }}> 
    <ListItem button onClick={onPageChange}>
     <ListItemIcon > 
         <HomeIcon /> 
         </ListItemIcon> 
         <ListItemText primary="Home" />
          </ListItem> 
          </Link>



        <Link to={{
          pathname: `${url}/MyProfile`,
          user: currentUser
        }}>      
            <ListItem button onClick={onPageChange}>
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
            <ListItem button onClick={onPageChange}>
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
          <ListItem button onClick={onPageChange}>
              <ListItemIcon>
                  <GamesIcon />
              </ListItemIcon>
          
            <ListItemText primary="Games List" />
            </ListItem>
            </Link>

        
            <Link to={{
            pathname:`${url}/ChatLobby`,
            user: currentUser
            }}> 
    <ListItem button onClick={onPageChange}>
     <ListItemIcon > 
         <ChatIcon /> 
         </ListItemIcon> 
         <ListItemText primary="Chat" />
          </ListItem> 
          </Link>

        </div>
      );

      if(unRegisteredUser){
        return (
          <div className="App" >
          <header className="App-header" >
          <Container component="main" maxWidth="xs">
            <CssBaseline />

              <Typography variant="h4" style={{color:'black', marginBottom: '30px', width:'100%'}}>
                You are unregistered. Please sign in first.
              </Typography>

              <Link to="/SignIn">
                <Button variant="contained" color="primary" fullWidth className={classes.button}>
                  Sign In
            </Button>
              </Link> 

          </Container>
          </header>
          
          </div>
        );
      }
    
      if(!userIsUpdated(currentUser)){
        return (<DisplayLoading/>);
      }

    return(
      <div>
 <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
  <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx( classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
  <Popup
    onClose={()=>{
      setUnreadMessages([]);
      resetUnreadMessages(currentUser.email); 
      currentUser.unReadMessages =[];
    }}
    trigger={
      <IconButton  edge="start" color="inherit" className={classes.menuButton}>
      <Badge badgeContent={unreadMessages.length} color="secondary">
        <NotificationsIcon/>
      </Badge>
    </IconButton>
    }
    
    position="bottom center"
    closeOnDocumentClick>
      <div className={classes.root}
      style={{ height: '200px', overflowX: 'hidden', overflowY: "auto",} }>
      <Container component="main" maxWidth="xs">

        <Typography variant="h6" style={{color:'black'}} >
          <PrintMessages url={url} messages={unreadMessages} user={currentUser} onPageChange={onPageChange} />
        </Typography>

        </Container>
      </div>
    </Popup>
  

    <Typography variant="h6" className={classes.title}>
    Two Truths and One Lie
   </Typography>


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

        <Route path={`${path}/ChatRoom/:email`} component = {Chat}/>  
        <Route path={`/JoinGame`} exact component={JoinGame} user={currentUser} />
        <Route path="/TheGame" exact component={TheGame}/>

        
        <Route path="/SignIn">
          <SignIn />
        </Route>

        <Route exact path={`/`}>
            <App />
          </Route>

         
          <Route path={`${path}/Home`}>
            <Home />
          </Route>

          <Route path={`${path}/GamesList`}>
            <GamesList />
          </Route>

          <Route path={`${path}/ChatLobby`}>
            <ChatLobby />
          </Route>


          <Route path={`${path}/MyProfile`} component ={MyProfile} />


          <Route path={`${path}/MySentences`}>
            <MySentences />
          </Route>

        </Switch>
        </main>

        </div>
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