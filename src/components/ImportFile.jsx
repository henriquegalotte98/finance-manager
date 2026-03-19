import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";

function ImportFile() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { setUser } = useContext(AuthContext); // agora você tem acesso ao setUser

  const aoSelecionar = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const aoEnviar = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", 2); // id do usuário logado

    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Upload concluído:", data);

      // 🔄 Atualiza o usuário imediatamente
      const userResponse = await fetch("http://localhost:3000/users/2");
      const updatedUser = await userResponse.json();
      setUser(updatedUser); // agora funciona
    } catch (err) {
      console.error("Erro no upload:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={aoSelecionar} />
      <button onClick={aoEnviar}>Enviar</button>
    </div>
  );
}

export default ImportFile;