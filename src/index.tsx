/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'
import './fonts/font.scss'

const root = document.getElementById('root')

render(() => <App />, root!)
