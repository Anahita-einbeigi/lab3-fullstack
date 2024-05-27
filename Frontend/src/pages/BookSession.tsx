import { useState, useEffect } from 'react';
import axios from 'axios';

interface Session {
  id: number;
  name: string;
  time: string;
  instructor: string;
  date: string;
}
function BookSession(){
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setDate(startDate.getDate() + 6);
        const response = await axios.get(
          `http://localhost:3000/api/sessions?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
        );
        console.log('Fetched sessions:', response.data);
        if (Array.isArray(response.data)) {
          setSessions(response.data);
        } else {
          console.error('Invalid response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [selectedDate]);

  const bookSession = async (sessionId: number) => {
    try {
      console.log(`Booking session with ID: ${sessionId}`);
      await axios.post('http://localhost:3000/api/bookings', { session_id: sessionId });
      console.log('Session booked successfully!');
      alert(`Session booked successfully!`);
    } catch (error) {
      console.error('Error booking session:', error);
    }
  };

  const displayDates: Date[] = [];
  const displayDate = new Date(selectedDate);

  for (let i = 0; i < 7; i++) {
    displayDates.push(new Date(displayDate));
    displayDate.setDate(displayDate.getDate() + 1);
  }

  const getDayName = (date: Date) => {
    const options = { weekday: 'long' as const };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const filteredSessions = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getFullYear() === date.getFullYear() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getDate() === date.getDate()
      );
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  return (
    <div style={{ marginTop: '165px', padding: '20px' }}>
      <h2>Book a Training Session</h2>
      <div>
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {displayDates.map((day) => (
                <th key={day.toISOString()} style={{ border: '1px solid #dfcbcb', padding: '8px' }}>
                  {day.getDate()} - {getDayName(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {displayDates.map((day) => {
                const daySessions = filteredSessions(day);
                console.log(`Sessions for ${day.toISOString().split('T')[0]}:`, daySessions);
                const isSelectedDay = isSameDay(day, selectedDate);
                return (
                  <td
                    key={day.toISOString()}
                    style={{
                      border: '1px solid black',
                      backgroundColor: isSelectedDay ? 'green' : 'white',
                      color: isSelectedDay ? 'white' : 'black'
                    }}
                  >
                    <div>
                      <strong>{day.getDate()}</strong>
                      <div>{getDayName(day)}</div>
                    </div>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                      {daySessions.length > 0 ? (
                        daySessions.map((session) => (
                          <li key={session.id} style={{ marginBottom: '10px' }}>
                            <div>{session.name}</div>
                            <div>{session.time} - {session.instructor}</div>
                            <button onClick={() => bookSession(session.id)}>Book</button>
                          </li>
                        ))
                      ) : (
                        <li>No sessions available</li>
                      )}
                    </ul>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookSession;
