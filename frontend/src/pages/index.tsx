import { Link } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ListIcon from '@material-ui/icons/List'
import { GetServerSideProps } from 'next'
import useTranslation from 'next-translate/useTranslation'
import NextLink from 'next/link'
import React from 'react'
import Consumption from '../components/consumption'
import PageLayout from '../components/PageLayout'
import ProTip from '../components/ProTip'

const useStyles = makeStyles((theme) => ({
  list: {},
  form: {
    width: '100%',
    marginBottom: theme.spacing(3),
  },
}))

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return {
    props: {},
  }
}

export default function Index() {
  const classes = useStyles()

  const { t } = useTranslation() // default namespace (optional)

  return (
    <PageLayout
      title="Page title"
      subtitle="Page description"
      icon={<ListIcon fontSize="large" />}
    >
      <Consumption.List />
      <Link href="/about" color="secondary" component={NextLink}>
        Go to the about page
      </Link>
      <ProTip />
    </PageLayout>
  )
}
