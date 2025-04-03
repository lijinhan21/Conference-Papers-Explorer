import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PaperList from './components/PaperList';
import FavoritePapers from './components/FavoritePapers';
import AuthorsPage from './components/AuthorsPage';
import Settings from './components/Settings';
import { AppBar, Toolbar, Button } from '@mui/material';

// 创建一个新的组件来处理导航栏
function NavigationBar() {
    const location = useLocation();
    
    return (
        <AppBar position="static">
            <Toolbar>
                <Button 
                    color="inherit" 
                    component={Link} 
                    to="/"
                    sx={{
                        borderBottom: location.pathname === '/' ? '2px solid white' : 'none',
                        borderRadius: 0
                    }}
                >
                    All Papers
                </Button>
                <Button 
                    color="inherit" 
                    component={Link} 
                    to="/authors"
                    sx={{
                        borderBottom: location.pathname === '/authors' ? '2px solid white' : 'none',
                        borderRadius: 0
                    }}
                >
                    Authors
                </Button>
                <Button 
                    color="inherit" 
                    component={Link} 
                    to="/favorites"
                    sx={{
                        borderBottom: location.pathname === '/favorites' ? '2px solid white' : 'none',
                        borderRadius: 0
                    }}
                >
                    Favorites
                </Button>
                <Button 
                    color="inherit" 
                    component={Link} 
                    to="/settings"
                    sx={{
                        borderBottom: location.pathname === '/settings' ? '2px solid white' : 'none',
                        borderRadius: 0,
                        marginLeft: 'auto'
                    }}
                >
                    设置
                </Button>
            </Toolbar>
        </AppBar>
    );
}

function App() {
    return (
        <Router>
            <NavigationBar />
            <Routes>
                <Route path="/" element={<PaperList />} />
                <Route path="/favorites" element={<FavoritePapers />} />
                <Route path="/authors" element={<AuthorsPage />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Router>
    );
}

export default App;