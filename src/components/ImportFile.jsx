import { useState } from "react";
import { useAuth } from "./AuthContext";

function ImportFile() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { user, setUser } = useAuth();

  const aoSelecionar = (event) => {
    setSelectedFile(event.target.files[0]);
    console.log("Arquivo selecionado:", event.target.files[0]);
  };

  const aoEnviar = async () => {
    console.log("aoEnviar chamado"); // ✅ teste
    console.log("User no contexto:", user);
    if (!selectedFile || !user) {
      console.warn("Nenhum arquivo ou usuário definido");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user.id);

    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Upload concluído:", data);

      const userResponse = await fetch(`http://localhost:3000/users/${user.id}`);
      const updatedUser = await userResponse.json();
      setUser(updatedUser);
      console.log("User no contexto:", user);
    } catch (err) {
      console.error("Erro no upload:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={aoSelecionar} />
      <button type="button" onClick={aoEnviar}>Enviar</button>
    </div>
  );
}

export default ImportFile;