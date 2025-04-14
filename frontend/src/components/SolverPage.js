import { Page, PageContent, Box, Text, Card, CardBody, CardFooter, Button, Spinner, Collapsible } from 'grommet';
import { CircleInformation } from 'grommet-icons';
import ReportFooter from './ReportFooter';
import Background from './Background';
import HomeButton from './HomeButton';
import PageTopScroller from './PageTopScroller';
import InfoBox from './InfoBox';

/*
* Name: SolverPage.js
* Author: Jacob Warren
* Description: Skeleton for solver pages.
*/

const SolverPage = ({ title, topic, description, DescriptionComponent, InfoText, InputComponent, input_props, error, handle_solve, loading, OutputComponent, output_props }) => {
  return (
    <PageTopScroller>
    <Page>
      <Background />
      <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <PageContent align="center" skeleton={false}>
          <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px'}}>
            <HomeButton />
          </Box>
          <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
            <Text size="xxlarge" weight="bold">
              {title}
            </Text>
          </Box>
          <Box align="center" justify="center">
            <Text size="large" margin="none" weight={500}>
              Topic: {topic}
            </Text>
          </Box>
          <Box align="center" justify="start" direction="column" cssGap={false} width='large'>
            <Text margin={{"bottom":"small"}} textAlign="center">
              {description}
            </Text>
            <DescriptionComponent />
          </Box>
          <Card width="large" pad="medium" background={{"color":"light-1"}}>
            <CardBody pad="small">
              <InfoBox InfoText={InfoText} />
              <InputComponent {...input_props} />
              {error && <Text color="status-critical" margin={{ top: 'small' }}>{error}</Text>}
            </CardBody>
            <CardFooter align="center" direction="row" flex={false} justify="center" gap="medium" pad={{"top":"small"}}>
              <Button label={loading ? <Spinner /> : "Solve"} onClick={handle_solve} disabled={loading} />
            </CardFooter>
          </Card>
          <Card width="large" pad="medium" background={{"color":"light-2"}} margin={{"top":"medium"}}>
            <CardBody pad="small">
              <Text weight="bold">
                Output:
              </Text>
              <Box align="center" justify="center" pad={{"vertical":"small"}} background={{"color":"light-3"}} round="xsmall">
                <OutputComponent {...output_props} />
              </Box>
            </CardBody>
          </Card>
          <ReportFooter />
        </PageContent>
      </Box>
    </Page>
    </PageTopScroller>
  );
};

export default SolverPage;
