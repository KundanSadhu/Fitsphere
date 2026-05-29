export async function addWorkoutToCalendarAndTasks(planName: string, dayName: string, exercises: any[]) {
    const token = (window as any).__google_access_token__;
    if (!token) {
        throw new Error('No Google access token found. Please sign in with Google directly.');
    }

    const desc = exercises.map(ex => `${ex.name}: ${ex.sets} sets x ${ex.reps} | Rest: ${ex.restSeconds}s`).join('\n');

    // Create a task
    const taskRes = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: `Workout: ${planName} - ${dayName}`,
            notes: desc,
            due: new Date().toISOString()
        })
    });
    
    if (!taskRes.ok) {
        const err = await taskRes.text();
        throw new Error('Failed to create task: ' + err);
    }

    // Create an event
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const eventRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            summary: `🏋️ ${planName} : ${dayName}`,
            description: desc,
            start: {
                dateTime: startTime.toISOString(),
            },
            end: {
                dateTime: endTime.toISOString(),
            }
        })
    });

    if (!eventRes.ok) {
        const err = await eventRes.text();
        throw new Error('Failed to create event: ' + err);
    }
}
