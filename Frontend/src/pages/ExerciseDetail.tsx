import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Exercise {
  id: string;
  title: string;
  description: string;
}

interface Comment {
  id: string;
  comment: string;
}

function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [exerciseRes, commentsRes] = await Promise.all([
          axios.get<Exercise>(`http://localhost:3000/api/exercises/${id}`),
          axios.get<Comment[]>(`http://localhost:3000/api/exercises/${id}/comments`)
        ]);
        setExercise(exerciseRes.data);
        setComments(commentsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDetails();
  }, [id]);

  const handleAddComment = async () => {
    if (!id) {
      console.error("Cannot post comment, exercise ID is undefined.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3000/api/exercises/${id}/comments`, {
        text: newComment
      });
      if (response.status === 201) {
        setComments(prev => [...prev, response.data]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/exercises/${id}/comments/${commentId}`);
      if (response.status === 204) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      } else {
        console.error("Unexpected status code received:", response.status);
        alert("Failed to delete the comment: Unexpected status code.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to delete comment:", error.response?.data);
        alert("Failed to delete the comment: " + error.response?.data.message);
      } else {
        console.error("An unexpected error occurred:", error);
        alert("An unexpected error occurred.");
      }
    }
  };

  return (
    <div style={{ padding: '20px', paddingTop:'50px' }}>
      {exercise ? (
        <>
        <div style={{ display:'flex'}}>
          <div>
            <h1 style={{ marginBottom: '20px', fontSize: '35px' }}>{exercise.title}</h1>
            <video width="440" height="440" controls>
              <source src="/images/videolegpress.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div style={{ marginTop: '20px'}}>
            <div style={{ marginBottom: '20px' }}>
              <h2>Comments</h2>
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ margin: 0, marginRight: '10px' }}>{comment.comment}</p>
                    <button onClick={() => handleDeleteComment(comment.id)} style={{
                      height: '20px',
                      padding: '2px 8px',
                      fontSize: '12px',
                      lineHeight: '16px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}>Delete</button>
                  </div>
                ))
              ) : (
                <p>No comments available</p>
              )}
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                style={{
                  height: '40px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  lineHeight: '16px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              />
              <button onClick={handleAddComment} style={{ height: '42px', marginLeft: '10px' }}>Add Comment</button>
            </div>
            <div>
              <h2>Key Takeaways</h2>
              <p>• Warm up properly before starting the leg press workout</p>
              <p>• Adjust the seat and backrest to align with your body's natural alignment</p>
              <p>• Choose a weight that challenges you but allows for proper form and range of motion</p>
              <p>• Continuously monitor and adjust the resistance level as your strength improves</p>
              <h3 style={{ marginTop: '20px' }}>Here are some leg alignment tips to help you maintain proper form:</h3>
              <p>
                1. Keep your feet hip-width apart: Position your feet on the footplate so that they're shoulder-width apart. This helps distribute the weight evenly and targets the muscles in your legs effectively.<br />
                2. Align your knees with your toes: As you perform the leg press, make sure your knees are tracking in the same direction as your toes. This prevents unnecessary stress on your knee joints.<br />
                3. Avoid excessive inward or outward rotation of the feet: Keeping your feet parallel throughout the exercise helps maintain proper alignment and improves stability.<br />
                4. Maintain a neutral spine: Keep your back flat against the seat and avoid rounding or arching your lower back. This promotes proper alignment and reduces the risk of back injuries.
              </p>
            </div>
          </div>
          </div>
        </>
      ) : (
        <p>Loading exercise details or not found...</p>
      )}
    </div>
  );
}

export default ExerciseDetail;
