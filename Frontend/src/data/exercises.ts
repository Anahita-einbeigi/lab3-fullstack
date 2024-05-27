export interface Exercise {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const exercises: Exercise[] = [
  { id: 1, title: "Arm Curls", description: "Curls for building biceps.", imageUrl: "/images/10.jpg" },
  { id: 2, title: "Leg Press", description: "Strengthens leg muscles.", imageUrl: "/images/14.jpg" },
  { id: 3, title: "Bench Press", description: "Builds chest muscles.", imageUrl: "/images/15.jpg" },
  { id: 4, title: "Ab Crunches", description: "Strengthens abdominal muscles.", imageUrl: "/images/13.jpg" },
  { id: 5, title: "Back Pulldown", description: "Targets the back muscles.", imageUrl: "/images/8.jpg" },
  { id: 6, title: "Squats", description: "Improves lower body strength and flexibility.", imageUrl: "/images/11.jpg" }
];

export default exercises;
