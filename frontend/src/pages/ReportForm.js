import React, { useState, useEffect } from 'react';
import { Page, PageContent, Box, Text, TextInput, Button, TextArea, Spinner } from 'grommet';
import { reportProblem } from '../api';
import HomeButton from '../components/HomeButton';
import Background from '../components/Background';
import PageTopScroller from '../components/PageTopScroller';

/*
* Name: ReportForm.js
* Author: Parker Clark
* Description: Form to report issues to the webmaster.
*  Rate limits submissions to 3 per hour, with a cooldown of 60 seconds between submissions.
*/

const ReportForm = () => {
    const [email, setEmail] = useState('');
    const [issue, setIssue] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    
    // Rate limiting states
    const [submissionCount, setSubmissionCount] = useState(0);
    const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    
    // Rate limiting constants
    const MAX_SUBMISSIONS = 3; // Maximum 3 submissions per hour
    const COOLDOWN_PERIOD = 60; // 60 seconds between submissions
    const RESET_PERIOD = 60 * 60 * 1000; // Reset count after 1 hour (in ms)
    
    // Load previous submission data on component mount
    useEffect(() => {
        const storedCount = localStorage.getItem('reportSubmissionCount');
        const storedTime = localStorage.getItem('lastReportSubmissionTime');
        
        if (storedCount) setSubmissionCount(parseInt(storedCount, 10));
        if (storedTime) setLastSubmissionTime(parseInt(storedTime, 10));
        
        // Reset count if it's been more than the reset period
        const now = Date.now();
        if (now - parseInt(storedTime, 10) > RESET_PERIOD) {
            setSubmissionCount(0);
            setLastSubmissionTime(0);
            localStorage.removeItem('reportSubmissionCount');
            localStorage.removeItem('lastReportSubmissionTime');
        }
    }, []);
    
    // Update time remaining for cooldown
    useEffect(() => {
        if (lastSubmissionTime > 0) {
            const interval = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - lastSubmissionTime) / 1000);
                const remaining = COOLDOWN_PERIOD - elapsed;
                
                if (remaining <= 0) {
                    setTimeRemaining(0);
                    clearInterval(interval);
                } else {
                    setTimeRemaining(remaining);
                }
            }, 1000);
            
            return () => clearInterval(interval);
        }
    }, [lastSubmissionTime]);

    const handleSubmit = async () => {
        if (!email || !issue) {
            setError('Please fill in both fields.');
            return;
        }
        
        // Check for rate limiting
        const now = Date.now();
        
        // Check if maximum submissions reached
        if (submissionCount >= MAX_SUBMISSIONS) {
            // Calculate time until reset
            const timeSinceFirst = now - lastSubmissionTime;
            const resetTimeMs = RESET_PERIOD - timeSinceFirst;
            
            if (resetTimeMs > 0) {
                const resetMinutes = Math.ceil(resetTimeMs / 60000);
                setError(`Maximum submissions reached. Please try again in approximately ${resetMinutes} minute(s).`);
                return;
            } else {
                // Reset counter if the time period has passed
                setSubmissionCount(0);
                localStorage.removeItem('reportSubmissionCount');
            }
        }
        
        // Check cooldown period
        if (lastSubmissionTime > 0) {
            const timeSinceLast = now - lastSubmissionTime;
            const cooldownMs = COOLDOWN_PERIOD * 1000;
            
            if (timeSinceLast < cooldownMs) {
                const secondsRemaining = Math.ceil((cooldownMs - timeSinceLast) / 1000);
                setError(`Please wait ${secondsRemaining} more second(s) before submitting again.`);
                return;
            }
        }

        setLoading(true);
        setError('');
        setSuccess('');

        if (!validateAddress(email)) {
            setLoading(false);
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const response = await reportProblem(email, issue);
            
            setLoading(false);

            if (response.status === 200) {
                // Update rate limiting data
                const newCount = submissionCount + 1;
                setSubmissionCount(newCount);
                setLastSubmissionTime(now);
                
                // Store in localStorage
                localStorage.setItem('reportSubmissionCount', newCount.toString());
                localStorage.setItem('lastReportSubmissionTime', now.toString());
                
                setSuccess('Your issue has been reported successfully.');
                setEmail('');
                setIssue('');
            } else if (response.status === 500) {
                setError('Unable to send report. Please try again later.');
            } else {
                setError('Unexpected error occurred. Please try again.');
            }
        } catch (error) {
            setLoading(false);
            setError('An error occurred. Please try again.');
        }
    };

    // Validate email format
    const validateAddress = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    return (
        <PageTopScroller>
        <Page>
            <Background />
            <Box align="center" justify="center" pad="medium" background="white" style={{ position: 'relative', zIndex: 1, width: '55%', margin: 'auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <PageContent align="center" skeleton={false} justify="center">
                <Box align="start" style={{ position: 'absolute', top: 0, left: 0, padding: '1px', background: 'white', borderRadius: '1px', transform: 'scale(1)', transformOrigin: 'top left'}}>
                    <HomeButton />
                </Box>
                    <Box align="center" justify="center" pad={{ vertical: 'medium' }}>
                        <Text size="xxlarge" weight="bold">
                            Problem Report Contact Page
                        </Text>
                    </Box>
                    <Box align="center" justify="center">
                        <Text size="large" margin="none" weight={500}>
                            Found a problem? Tell us about it!
                        </Text>
                    </Box>
                    
                    {/* Rate limiting info */}
                    <Box align="center" justify="center" margin={{ top: 'small' }}>
                        <Text size="small" color="text-xweak">
                            Submissions: {submissionCount}/{MAX_SUBMISSIONS} per hour
                            {timeRemaining > 0 && ` (Next submission available in ${timeRemaining} seconds)`}
                        </Text>
                    </Box>
                    
                    <Box align="center" justify="center" margin={{ vertical: 'xsmall' }} width="large">
                        <TextArea
                            placeholder="Tell us what went wrong"
                            size="large"
                            resize="vertical"
                            style={{ height: '300px' }}
                            value={issue}
                            onChange={(event) => setIssue(event.target.value)}
                        />
                    </Box>
                    <Box align="center" justify="center">
                        <TextInput
                            placeholder="Your email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                        <Box align="center" justify="center" margin={{ vertical: 'small' }}>
                            <Button 
                                label={loading ? <Spinner /> : "Send"} 
                                onClick={handleSubmit} 
                                disabled={loading || timeRemaining > 0 || submissionCount >= MAX_SUBMISSIONS} 
                            />
                        </Box>
                    </Box>
                    {error && <Text color="status-critical">{error}</Text>}
                    {success && <Text color="status-ok">{success}</Text>}
                </PageContent>
            </Box>
        </Page>
        </PageTopScroller>
    );
};

export default ReportForm;