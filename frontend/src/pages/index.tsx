import { Typography, Link, TextField, Button, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ListIcon from "@material-ui/icons/List";
import useTranslation from "next-translate/useTranslation";
import React from "react";
import MyTable from "../components/MyTable";
import PageLayout from "../components/PageLayout";
import ProTip from "../components/ProTip";

const useStyles = makeStyles((theme) => ({
  form: {
    width: "100%",
  },
}));

export default function Index() {
  const classes = useStyles();

  const { t } = useTranslation(); // default namespace (optional)

  return (
    <PageLayout
      title="Page title"
      subtitle="Page description"
      icon={<ListIcon fontSize="large" />}
    >
      <form name="consumption" className={classes.form}>
        <Grid direction="row">
          <Grid item>
            <TextField
              variant="outlined"
              id="collectiveName"
              label="Collective name"
              name="collectiveName"
              margin="normal"
              required
              autoFocus
            />
          </Grid>
          <Grid item>
            <TextField
              variant="outlined"
              id="consumptionQty"
              label="Consumed Qty."
              name="inventoryQty"
              margin="normal"
              required
              autoFocus
            />
          </Grid>
          <Grid item>
            <Button type="submit" variant="contained" color="primary">
              Consumed
            </Button>
          </Grid>
        </Grid>
      </form>
      <MyTable />
      <Link href="/about" color="secondary">
        Go to the about page
      </Link>
      <ProTip />
    </PageLayout>
  );
}
