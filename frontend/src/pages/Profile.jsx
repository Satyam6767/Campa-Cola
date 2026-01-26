import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { Container, Typography, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const { data } = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
        My Profile
      </Typography>

      <Card>
        <CardContent>
          <Typography><strong>Name: </strong> {user.name}</Typography>
          <Typography><strong>Email: </strong> {user.email}</Typography>
          <Typography><strong>Phone: </strong> {user.phone}</Typography>
          <Typography><strong>Address: </strong> {user.address}</Typography>
          <Typography><strong>Role: </strong> {user.role}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
