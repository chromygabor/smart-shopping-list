import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import { red, indigo, blueGrey } from '@material-ui/core/colors'

// Create a theme instance.
const theme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      primary: {
        light: indigo[300],
        main: indigo[500],
      },
      secondary: {
        light: blueGrey[300],
        main: blueGrey[500],
      },
      error: {
        main: red[500],
      },
      background: {
        default: '#fff',
      },
    },
  })
)

export default theme
