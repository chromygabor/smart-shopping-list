import { Box } from '@material-ui/core'
import * as React from 'react'

interface IGrowBoxProps {}

const GrowBox: React.FC<IGrowBoxProps> = (props: IGrowBoxProps) => {
  return <Box style={{ flexGrow: 1 }}>&nbsp;</Box>
}

export default GrowBox
