import { Card, makeStyles, Paper, Typography } from "@material-ui/core";
import * as React from "react";
import { ReactNode } from "react";

export interface IPageHeaderProps {
  title: string;
  subtitle: string;
  icon: JSX.Element;
}

const useStyles = makeStyles((theme) => ({
  root: {},
  pageHeader: {
    padding: theme.spacing(4),
    display: "flex",
    marginBottom: theme.spacing(2),
  },
  pageIcon: {
    display: "inline-block",
    padding: theme.spacing(2),
    borderRadius: "12px",
  },
  pageTitle: {
    paddingLeft: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    "& .MuiTypography-subtitle2": {
      opacity: "0.5",
    },
  },
}));

const PageHeader: React.FC<IPageHeaderProps> = ({
  title,
  subtitle,
  icon,
}: IPageHeaderProps) => {
  const classes = useStyles();
  return (
    <Paper elevation={0} square className={classes.root}>
      <div className={classes.pageHeader}>
        <Card className={classes.pageIcon}>{icon}</Card>
        <div className={classes.pageTitle}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Typography variant="subtitle2" component="div">
            {subtitle}
          </Typography>
        </div>
      </div>
    </Paper>
  );
};

export default PageHeader;
