import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { createTheme, ThemeProvider } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#9575cd', // 浅紫色作为主色
      light: '#c7a4ff',
      dark: '#65499c',
    },
    secondary: {
      main: '#81c784', // 浅绿色作为辅助色
      light: '#b2fab4',
      dark: '#519657',
    },
    background: {
      default: '#f8f6ff', // 非常浅的紫色作为背景
      paper: '#ffffff',
    },
    text: {
      primary: '#2c2c2c',
      secondary: '#595959',
    },
    success: {
      main: '#81c784', // 使用浅绿色作为成功状态的颜色
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderLeft: '4px solid #9575cd', // 卡片左边框使用浅紫色
          '&:hover': {
            borderLeft: '4px solid #81c784', // 悬停时变成浅绿色
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(45deg, #9575cd 30%, #81c784 90%)', // 渐变按钮
          '&:hover': {
            background: 'linear-gradient(45deg, #81c784 30%, #9575cd 90%)', // 悬停时反转渐变
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#f0ebff', // 选中状态使用非常浅的紫色
            '&:hover': {
              backgroundColor: '#e8f5e9', // 悬停时使用非常浅的绿色
            }
          }
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
) 